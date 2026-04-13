import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithCompany } from "@/lib/auth";
import { handleError } from "@/lib/errors";

// Cache exchange rates for 1 hour (in-memory)
let rateCache: { rates: Record<string, number>; base: string; fetchedAt: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function fetchExchangeRates(baseCurrency: string): Promise<Record<string, number>> {
  // Check cache
  if (rateCache && rateCache.base === baseCurrency && Date.now() - rateCache.fetchedAt < CACHE_TTL) {
    return rateCache.rates;
  }

  // Use Frankfurter API (based on European Central Bank data)
  // Free, no API key required, reliable institutional source
  const res = await fetch(`https://api.frankfurter.app/latest?from=${baseCurrency}`);

  if (!res.ok) {
    // Fallback: try with USD as base and convert
    if (baseCurrency !== "USD") {
      const fallbackRes = await fetch(`https://api.frankfurter.app/latest?from=USD`);
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        const rates = fallbackData.rates as Record<string, number>;
        // Convert all rates to be relative to the requested base currency
        const baseToUsd = rates[baseCurrency];
        if (baseToUsd) {
          const converted: Record<string, number> = { USD: 1 / baseToUsd };
          for (const [code, rate] of Object.entries(rates)) {
            if (code !== baseCurrency) {
              converted[code] = (rate as number) / baseToUsd;
            }
          }
          rateCache = { rates: converted, base: baseCurrency, fetchedAt: Date.now() };
          return converted;
        }
      }
    }
    throw new Error("Failed to fetch exchange rates");
  }

  const data = await res.json();
  const rates = data.rates as Record<string, number>;

  // Cache the result
  rateCache = { rates, base: baseCurrency, fetchedAt: Date.now() };

  return rates;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthWithCompany();

    // Get the base currency from query params or use company currency
    const { searchParams } = new URL(request.url);
    const baseCurrency = searchParams.get("base") || "USD";

    const rates = await fetchExchangeRates(baseCurrency);

    return NextResponse.json({
      base: baseCurrency,
      rates,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return handleError(err);
  }
}
