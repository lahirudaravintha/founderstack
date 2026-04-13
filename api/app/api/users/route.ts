import { NextResponse } from "next/server";
import { requireAuthWithCompany } from "@/lib/auth";
import { handleError } from "@/lib/errors";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuthWithCompany();

    const users = await prisma.user.findMany({
      where: { companyId: user.companyId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(users);
  } catch (err) {
    return handleError(err);
  }
}
