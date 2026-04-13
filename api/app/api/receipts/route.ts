import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithCompany } from "@/lib/auth";
import { requireModuleAccess } from "@/lib/permissions";
import { handleError } from "@/lib/errors";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireAuthWithCompany();
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "expenses", "read");

    const receipts = await prisma.receipt.findMany({
      where: { companyId: user.companyId },
      include: {
        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        expense: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(receipts);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthWithCompany();
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "expenses", "write");

    const body = await request.json();

    // Check file size (25MB limit) - base64 is ~33% larger than raw
    if (body.imageUrl && body.imageUrl.length > 25 * 1024 * 1024 * 1.37) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "File too large. Maximum size is 25MB.", status: 422 } },
        { status: 422 }
      );
    }

    // Create receipt with "processing" status
    const receipt = await prisma.receipt.create({
      data: {
        companyId: user.companyId,
        uploadedById: user.id,
        imageUrl: body.imageUrl,
        status: "processing",
      },
    });

    // Create a pending expense linked to this receipt (with placeholder data until OCR completes)
    await prisma.expense.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        description: "Receipt upload",
        amount: 0,
        currency: "USD",
        category: "other",
        date: new Date(),
        status: "pending",
        receiptId: receipt.id,
      },
    });

    // Return the receipt — frontend will call /api/receipts/[id]/ocr next
    const updated = await prisma.receipt.findUnique({
      where: { id: receipt.id },
      include: {
        expense: { select: { id: true, status: true } },
      },
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (err) {
    console.error("Receipt upload error:", err);
    return handleError(err);
  }
}
