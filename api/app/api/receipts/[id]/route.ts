import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthWithCompany } from "@/lib/auth";
import { requireModuleAccess } from "@/lib/permissions";
import { handleError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/db";

const UpdateReceiptSchema = z.object({
  vendor: z.string().optional(),
  date: z.string().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
}).strict();

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
        ...(data.vendor !== undefined && { vendor: data.vendor }),
        ...(data.date !== undefined && { date: new Date(data.date) }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

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
