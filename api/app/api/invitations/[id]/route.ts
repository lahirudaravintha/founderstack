import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithCompany } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { handleError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Authenticate
    const user = await requireAuthWithCompany();

    // 2. Authorize — admin or above
    requireRole(user, "admin");

    // 3. Execute
    const invitation = await prisma.invitation.findUnique({ where: { id } });

    if (!invitation || invitation.companyId !== user.companyId) {
      throw new AppError("NOT_FOUND", "Invitation not found");
    }

    if (invitation.status !== "pending") {
      throw new AppError("VALIDATION_ERROR", "Only pending invitations can be revoked");
    }

    await prisma.invitation.delete({ where: { id } });

    // 4. Respond
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
