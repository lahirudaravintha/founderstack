import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithCompany } from "@/lib/auth";
import { requireModuleAccess } from "@/lib/permissions";
import { handleError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireAuthWithCompany();
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "capital", "read");

    const receipt = await prisma.receipt.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!receipt) throw new AppError("NOT_FOUND", "Receipt not found");

    return NextResponse.json(receipt);
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireAuthWithCompany();
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "capital", "write");

    const body = await request.json();

    const existing = await prisma.receipt.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!existing) throw new AppError("NOT_FOUND", "Receipt not found");

    const receipt = await prisma.receipt.update({
      where: { id },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.extractedData !== undefined && { extractedData: body.extractedData }),
        ...(body.transactionId !== undefined && { transactionId: body.transactionId }),
      },
    });

    // If expense data is provided, also update the linked expense
    if (body.expenseData) {
      const linkedExpense = await prisma.expense.findFirst({
        where: { receiptId: id },
      });
      if (linkedExpense) {
        await prisma.expense.update({
          where: { id: linkedExpense.id },
          data: {
            ...(body.expenseData.description && { description: body.expenseData.description }),
            ...(body.expenseData.amount !== undefined && { amount: body.expenseData.amount }),
            ...(body.expenseData.currency && { currency: body.expenseData.currency }),
            ...(body.expenseData.category && { category: body.expenseData.category }),
            ...(body.expenseData.date && { date: new Date(body.expenseData.date) }),
          },
        });
      }
    }

    return NextResponse.json(receipt);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireAuthWithCompany();
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "capital", "write");

    const existing = await prisma.receipt.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!existing) throw new AppError("NOT_FOUND", "Receipt not found");

    await prisma.receipt.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleError(err);
  }
}
