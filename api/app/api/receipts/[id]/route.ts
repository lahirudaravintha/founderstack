import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthWithCompany } from "@/lib/auth";
import { requireModuleAccess } from "@/lib/permissions";
import { handleError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/db";

const UpdateReceiptSchema = z.object({
  status: z.string().optional(),
  extractedData: z.record(z.unknown()).optional(),
  expenseData: z.object({
    description: z.string().optional(),
    amount: z.number().optional(),
    currency: z.string().optional(),
    category: z.string().optional(),
    date: z.string().optional(),
  }).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireAuthWithCompany();
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "expenses", "read");

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
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "expenses", "write");

    const body = await request.json();
    const data = UpdateReceiptSchema.parse(body);

    const existing = await prisma.receipt.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!existing) throw new AppError("NOT_FOUND", "Receipt not found");

    const receipt = await prisma.receipt.update({
      where: { id },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.extractedData !== undefined && { extractedData: data.extractedData }),
      },
      include: { expense: { select: { id: true, status: true } } },
    });

    // Update linked expense if expenseData provided
    if (data.expenseData && receipt.expense) {
      await prisma.expense.update({
        where: { id: receipt.expense.id },
        data: {
          ...(data.expenseData.description !== undefined && { description: data.expenseData.description }),
          ...(data.expenseData.amount !== undefined && { amount: data.expenseData.amount }),
          ...(data.expenseData.currency !== undefined && { currency: data.expenseData.currency }),
          ...(data.expenseData.category !== undefined && { category: data.expenseData.category }),
          ...(data.expenseData.date !== undefined && { date: new Date(data.expenseData.date) }),
        },
      });
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
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "expenses", "write");

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
