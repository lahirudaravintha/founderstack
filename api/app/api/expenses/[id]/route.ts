import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithCompany } from "@/lib/auth";
import { requireModuleAccess } from "@/lib/permissions";
import { handleError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { UpdateExpenseInput } from "@shared/schemas/expense.schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireAuthWithCompany();
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "expenses", "read");

    const expense = await prisma.expense.findFirst({
      where: { id, companyId: user.companyId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        receipt: { select: { id: true, imageUrl: true, status: true, extractedData: true } },
      },
    });

    if (!expense) throw new AppError("NOT_FOUND", "Expense not found");

    return NextResponse.json(expense);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireAuthWithCompany();
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "expenses", "write");

    const body = await request.json();
    const data = UpdateExpenseInput.parse(body);

    const existing = await prisma.expense.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!existing) throw new AppError("NOT_FOUND", "Expense not found");

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        ...(data.description !== undefined && { description: data.description }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.status !== undefined && { status: data.status }),

        ...(data.reimbursementFile !== undefined && { reimbursementFile: data.reimbursementFile }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    return NextResponse.json(expense);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireAuthWithCompany();
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "expenses", "write");

    const existing = await prisma.expense.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!existing) throw new AppError("NOT_FOUND", "Expense not found");

    await prisma.expense.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
