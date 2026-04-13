import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithCompany } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { handleError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { z } from "zod";

const UpdateRoleInput = z.object({
  role: z.enum(["admin", "member", "viewer"]),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthWithCompany();
    requireRole(user, "admin");

    const { id } = await params;

    const body = await request.json();
    const data = UpdateRoleInput.parse(body);

    // Find the target user
    const targetUser = await prisma.user.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!targetUser) {
      throw new AppError("NOT_FOUND", "User not found in your company");
    }

    // Cannot change the owner's role
    if (targetUser.role === "owner") {
      throw new AppError("FORBIDDEN", "Cannot change the owner's role");
    }

    // Cannot change your own role
    if (targetUser.id === user.id) {
      throw new AppError("FORBIDDEN", "Cannot change your own role");
    }

    const updated = await prisma.user.update({
      where: { id, companyId: user.companyId },
      data: { role: data.role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthWithCompany();
    requireRole(user, "admin");

    const { id } = await params;

    // Find the target user
    const targetUser = await prisma.user.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!targetUser) {
      throw new AppError("NOT_FOUND", "User not found in your company");
    }

    // Cannot delete the owner
    if (targetUser.role === "owner") {
      throw new AppError("FORBIDDEN", "Cannot remove the company owner");
    }

    // Cannot delete yourself
    if (targetUser.id === user.id) {
      throw new AppError("FORBIDDEN", "Cannot remove yourself from the company");
    }

    // Delete module access records and detach from company
    await prisma.$transaction([
      prisma.moduleAccess.deleteMany({
        where: { userId: id },
      }),
      prisma.user.update({
        where: { id },
        data: { companyId: null, role: "member" },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
