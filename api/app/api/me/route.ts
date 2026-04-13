import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { handleError } from "@/lib/errors";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuth();

    const company = user.companyId
      ? await prisma.company.findUnique({ where: { id: user.companyId } })
      : null;

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyId: user.companyId,
      role: user.role,
      company,
    });
  } catch (err) {
    return handleError(err);
  }
}
