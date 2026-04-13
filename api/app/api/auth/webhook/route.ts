import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Webhook secret not configured", status: 500 } },
      { status: 500 }
    );
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Missing webhook headers", status: 401 } },
      { status: 401 }
    );
  }

  const body = await request.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let event: {
    type: string;
    data: {
      id: string;
      email_addresses: { email_address: string }[];
      first_name: string | null;
      last_name: string | null;
      image_url: string | null;
    };
  };

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof event;
  } catch {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid webhook signature", status: 401 } },
      { status: 401 }
    );
  }

  if (event.type === "user.created") {
    const { id: clerkId, email_addresses, first_name, last_name, image_url } = event.data;
    const email = email_addresses[0]?.email_address;

    if (!email) {
      return NextResponse.json({ received: true });
    }

    try {
      // Check if there's a pending invitation for this email
      const invitation = await prisma.invitation.findFirst({
        where: {
          email,
          status: "pending",
          expiresAt: { gt: new Date() },
        },
      });

      // Use upsert to handle race condition with requireAuth()
      await prisma.user.upsert({
        where: { clerkId },
        create: {
          clerkId,
          email,
          firstName: first_name || "",
          lastName: last_name || "",
          avatarUrl: image_url,
          companyId: invitation?.companyId ?? null,
          role: invitation?.role ?? "member",
        },
        update: {
          // If user was already created by requireAuth() without a company,
          // update them with the invitation data
          ...(invitation
            ? {
                companyId: invitation.companyId,
                role: invitation.role,
              }
            : {}),
        },
      });

      // Mark invitation as accepted
      if (invitation) {
        await prisma.invitation.update({
          where: { id: invitation.id },
          data: { status: "accepted" },
        });
      }
    } catch (err) {
      console.error("Webhook user.created error:", err);
    }
  }

  return NextResponse.json({ received: true });
}
