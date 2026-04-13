import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithCompany } from "@/lib/auth";
import { requireModuleAccess } from "@/lib/permissions";
import { handleError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { extractReceiptData } from "@/lib/ocr";

// Allow up to 60s for OCR processing (requires Pro plan; Hobby caps at 10s)
export const maxDuration = 60;

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const user = await requireAuthWithCompany();
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "expenses", "write");

    const receipt = await prisma.receipt.findFirst({
      where: { id, companyId: user.companyId },
      include: { expense: true },
    });

    if (!receipt) throw new AppError("NOT_FOUND", "Receipt not found");

    if (!receipt.imageUrl?.startsWith("data:")) {
      throw new AppError("VALIDATION_ERROR", "Receipt has no processable image");
    }

    let extractedData = null;

    try {
      extractedData = await extractReceiptData(receipt.imageUrl);

      await prisma.receipt.update({
        where: { id },
        data: {
          extractedData: JSON.parse(JSON.stringify(extractedData)),
          status: extractedData.confidence > 0 ? "reviewed" : "failed",
        },
      });

      // Update the linked expense with extracted data
      if (receipt.expense && extractedData.confidence > 0) {
        await prisma.expense.update({
          where: { id: receipt.expense.id },
          data: {
            description: extractedData.vendorName || "Receipt upload",
            amount: extractedData.totalAmount || 0,
            currency: extractedData.currency || "USD",
            category: extractedData.category || "other",
            date: extractedData.date ? new Date(extractedData.date) : new Date(),
          },
        });
      }
    } catch (ocrErr) {
      console.error("OCR failed:", ocrErr);
      await prisma.receipt.update({
        where: { id },
        data: { status: "failed" },
      });
    }

    // Return updated receipt
    const updated = await prisma.receipt.findUnique({
      where: { id },
      include: {
        expense: { select: { id: true, status: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("OCR endpoint error:", err);
    return handleError(err);
  }
}
