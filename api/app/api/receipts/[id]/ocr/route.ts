import { NextRequest } from "next/server";
import { requireAuthWithCompany } from "@/lib/auth";
import { requireModuleAccess } from "@/lib/permissions";
import { handleError, AppError } from "@/lib/errors";
import { prisma } from "@/lib/db";
import { extractReceiptData } from "@/lib/ocr";

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

    // Use a streaming response to avoid Vercel's 10s timeout on Hobby plan.
    // Streaming responses get up to 60s, enough for OCR.
    const encoder = new TextEncoder();
    const imageUrl = receipt.imageUrl;
    const expenseId = receipt.expense?.id;

    const stream = new ReadableStream({
      async start(controller) {
        // Send an initial chunk to establish the stream
        controller.enqueue(encoder.encode(JSON.stringify({ status: "processing" }) + "\n"));

        try {
          const extractedData = await extractReceiptData(imageUrl);

          await prisma.receipt.update({
            where: { id },
            data: {
              extractedData: JSON.parse(JSON.stringify(extractedData)),
              status: extractedData.confidence > 0 ? "reviewed" : "failed",
            },
          });

          // Update the linked expense with extracted data
          if (expenseId && extractedData.confidence > 0) {
            await prisma.expense.update({
              where: { id: expenseId },
              data: {
                description: extractedData.vendorName || "Receipt upload",
                amount: extractedData.totalAmount || 0,
                currency: extractedData.currency || "USD",
                category: extractedData.category || "other",
                date: extractedData.date ? new Date(extractedData.date) : new Date(),
              },
            });
          }

          const updated = await prisma.receipt.findUnique({
            where: { id },
            include: { expense: { select: { id: true, status: true } } },
          });

          controller.enqueue(encoder.encode(JSON.stringify({ status: "done", receipt: updated }) + "\n"));
        } catch (ocrErr: any) {
          console.error("OCR failed:", ocrErr?.message || ocrErr, ocrErr?.status, ocrErr?.error);
          await prisma.receipt.update({
            where: { id },
            data: { status: "failed" },
          });
          controller.enqueue(encoder.encode(JSON.stringify({ status: "failed" }) + "\n"));
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("OCR endpoint error:", err);
    return handleError(err);
  }
}
