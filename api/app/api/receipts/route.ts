import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithCompany } from "@/lib/auth";
import { requireModuleAccess } from "@/lib/permissions";
import { handleError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { extractReceiptData } from "@/lib/ocr";

export async function GET() {
  try {
    const user = await requireAuthWithCompany();
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "capital", "read");

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
    requireModuleAccess(user as Parameters<typeof requireModuleAccess>[0], "capital", "write");

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

    let extractedData = null;

    // Run OCR if it's a base64 data URL (image or PDF) with 30s timeout
    if (body.imageUrl?.startsWith("data:")) {
      try {
        const ocrPromise = extractReceiptData(body.imageUrl);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("OCR timed out")), 30000)
        );
        extractedData = await Promise.race([ocrPromise, timeoutPromise]);

        await prisma.receipt.update({
          where: { id: receipt.id },
          data: {
            extractedData: JSON.parse(JSON.stringify(extractedData)),
            status: extractedData.confidence > 0 ? "reviewed" : "failed",
          },
        });
      } catch (ocrErr) {
        console.error("OCR failed:", ocrErr);
        await prisma.receipt.update({
          where: { id: receipt.id },
          data: { status: "failed" },
        });
      }
    }

    // Auto-create a pending expense linked to this receipt
    const expenseData = {
      companyId: user.companyId,
      userId: user.id,
      description: extractedData?.vendorName || "Receipt upload",
      amount: extractedData?.totalAmount || 0,
      currency: extractedData?.currency || "USD",
      category: extractedData?.category || "other",
      date: extractedData?.date ? new Date(extractedData.date) : new Date(),
      status: "pending" as const,
      receiptId: receipt.id,
    };

    await prisma.expense.create({ data: expenseData });

    // Return the updated receipt
    const updated = await prisma.receipt.findUnique({
      where: { id: receipt.id },
      include: {
        expense: { select: { id: true, status: true } },
      },
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
