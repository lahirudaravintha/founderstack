import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { resolve } from "path";

function getApiKey(): string {
  // Try env var first
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }
  // Fallback: read directly from .env file
  try {
    const envPath = resolve(process.cwd(), ".env");
    const content = readFileSync(envPath, "utf-8");
    const match = content.match(/ANTHROPIC_API_KEY=["']?([^\s"']+)["']?/);
    if (match) return match[1];
  } catch {}
  throw new Error("ANTHROPIC_API_KEY not found");
}

function getClient() {
  return new Anthropic({
    apiKey: getApiKey(),
  });
}

export type ExtractedReceiptData = {
  vendorName?: string;
  date?: string;
  totalAmount?: number; // in cents
  currency?: string;
  category?: string;
  lineItems?: { description: string; totalPrice: number }[];
  confidence: number;
  rawText?: string;
};

export async function extractReceiptData(
  base64DataUrl: string
): Promise<ExtractedReceiptData> {
  // Extract the base64 content and media type from data URL
  const match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid base64 data URL");
  }

  const rawMediaType = match[1];
  const base64Data = match[2];
  const isPdf = rawMediaType === "application/pdf";
  const mediaType = rawMediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

  const contentBlock = isPdf
    ? {
        type: "document" as const,
        source: {
          type: "base64" as const,
          media_type: "application/pdf" as const,
          data: base64Data,
        },
      }
    : {
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: mediaType,
          data: base64Data,
        },
      };

  const response = await getClient().messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          contentBlock,
          {
            type: "text",
            text: `Analyze this receipt/invoice and extract the following information. Return ONLY a valid JSON object with no other text:

{
  "vendorName": "the store or business name",
  "date": "YYYY-MM-DD format",
  "totalAmount": total amount in cents (e.g. $15.99 = 1599),
  "currency": "USD" or appropriate currency code,
  "category": one of: "cash", "equipment", "services", "intellectual_property", "real_estate", "other",
  "lineItems": [{"description": "item name", "totalPrice": price in cents}],
  "confidence": a number 0-1 indicating how confident you are in the extraction,
  "rawText": "all readable text from the receipt"
}

If you cannot read a field, set it to null. Always return valid JSON.`,
          },
        ],
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    return { confidence: 0 };
  }

  try {
    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = textContent.text.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(jsonStr);
    return {
      vendorName: parsed.vendorName || undefined,
      date: parsed.date || undefined,
      totalAmount: parsed.totalAmount ? Number(parsed.totalAmount) : undefined,
      currency: parsed.currency || "USD",
      category: parsed.category || "other",
      lineItems: parsed.lineItems || undefined,
      confidence: parsed.confidence ?? 0.5,
      rawText: parsed.rawText || undefined,
    };
  } catch {
    return {
      confidence: 0,
      rawText: textContent.text,
    };
  }
}
