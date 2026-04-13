import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithCompany } from "@/lib/auth";
import { requireModuleAccess } from "@/lib/permissions";
import { handleError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { CreateContributionInput } from "@shared/schemas/capital.schema";

export async function GET() {
  try {
    // 1. Authenticate
    const user = await requireAuthWithCompany();

    // 2. Authorize
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "capital", "read");

    // 3. Execute — always scoped to user's company
    const contributions = await prisma.capitalContribution.findMany({
      where: { companyId: user.companyId },
      include: { contributor: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { date: "desc" },
    });

    // 4. Respond
    return NextResponse.json(contributions);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const user = await requireAuthWithCompany();

    // 2. Authorize
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "capital", "write");

    // 3. Validate
    const body = await request.json();
    const data = CreateContributionInput.parse(body);

    // 4. Execute
    const contribution = await prisma.capitalContribution.create({
      data: {
        companyId: user.companyId,
        contributorId: user.id,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        category: data.category,
        date: new Date(data.date),
        notes: data.notes,
      },
    });

    // 5. Respond
    return NextResponse.json(contribution, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
