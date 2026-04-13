import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithCompany } from "@/lib/auth";
import { requireModuleAccess } from "@/lib/permissions";
import { handleError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { UpdateContributionInput } from "@shared/schemas/capital.schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // 1. Authenticate
    const user = await requireAuthWithCompany();

    // 2. Authorize
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "capital", "read");

    // 3. Execute — scoped to company
    const contribution = await prisma.capitalContribution.findFirst({
      where: { id, companyId: user.companyId },
      include: { contributor: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    if (!contribution) {
      throw new AppError("NOT_FOUND", "Capital contribution not found");
    }

    // 4. Respond
    return NextResponse.json(contribution);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // 1. Authenticate
    const user = await requireAuthWithCompany();

    // 2. Authorize
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "capital", "write");

    // 3. Validate
    const body = await request.json();
    const data = UpdateContributionInput.parse(body);

    // Check it exists and belongs to this company
    const existing = await prisma.capitalContribution.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!existing) {
      throw new AppError("NOT_FOUND", "Capital contribution not found");
    }

    // 4. Execute
    const contribution = await prisma.capitalContribution.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    // 5. Respond
    return NextResponse.json(contribution);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // 1. Authenticate
    const user = await requireAuthWithCompany();

    // 2. Authorize
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "capital", "write");

    // 3. Execute — scoped to company
    const existing = await prisma.capitalContribution.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!existing) {
      throw new AppError("NOT_FOUND", "Capital contribution not found");
    }

    await prisma.capitalContribution.delete({ where: { id } });

    // 4. Respond
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
