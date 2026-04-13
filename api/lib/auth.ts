import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./db";
import { AppError } from "./errors";
import type { User } from "@/generated/prisma/client";

export async function requireAuth(): Promise<User> {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new AppError("UNAUTHORIZED", "Authentication required");
  }

  let user = await prisma.user.findUnique({
    where: { clerkId },
    include: { moduleAccess: true },
  });

  // Auto-create user in DB if they exist in Clerk but not in our database
  if (!user) {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(clerkId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    // Check if there's a pending invitation for this email
    const invitation = email
      ? await prisma.invitation.findFirst({
          where: { email, status: "pending", expiresAt: { gt: new Date() } },
        })
      : null;

    user = await prisma.user.create({
      data: {
        clerkId,
        email: email || "",
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        avatarUrl: clerkUser.imageUrl,
        companyId: invitation?.companyId ?? null,
        role: invitation?.role ?? "member",
      },
      include: { moduleAccess: true },
    });

    // Mark invitation as accepted
    if (invitation) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "accepted" },
      });
    }
  }

  // If user exists but has no company, check again for pending invitations
  // This handles the case where the user was created before the invitation was sent,
  // or a previous invite attempt failed
  if (!user.companyId) {
    const invitation = await prisma.invitation.findFirst({
      where: { email: user.email, status: "pending", expiresAt: { gt: new Date() } },
    });

    if (invitation) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          companyId: invitation.companyId,
          role: invitation.role,
        },
        include: { moduleAccess: true },
      });

      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "accepted" },
      });
    }
  }

  return user;
}

export async function requireAuthWithCompany(): Promise<User & { companyId: string }> {
  const user = await requireAuth();

  if (!user.companyId) {
    throw new AppError("FORBIDDEN", "You must belong to a company to perform this action");
  }

  return user as User & { companyId: string };
}
