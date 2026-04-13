import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithCompany } from "@/lib/auth";
import { requireModuleAccess } from "@/lib/permissions";
import { handleError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { CreateExpenseInput } from "@shared/schemas/expense.schema";

export async function GET() {
  try {
    const user = await requireAuthWithCompany();
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "expenses", "read");

    const expenses = await prisma.expense.findMany({
      where: { companyId: user.companyId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        receipt: { select: { id: true, imageUrl: true, status: true, extractedData: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(expenses);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthWithCompany();
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "expenses", "write");

    const body = await request.json();
    const data = CreateExpenseInput.parse(body);

    const expense = await prisma.expense.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        category: data.category,
        date: new Date(data.date),
        notes: data.notes,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
