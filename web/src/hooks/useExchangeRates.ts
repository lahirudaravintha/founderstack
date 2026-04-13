import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useMe } from "./useMe";

type ExchangeRateResponse = {
  base: string;
  rates: Record<string, number>;
  timestamp: string;
};

export function useExchangeRates() {
  const { data: me } = useMe();
  const baseCurrency = me?.company?.currency || "USD";

  return useQuery({
    queryKey: ["exchange-rates", baseCurrency],
    queryFn: () => api.get<ExchangeRateResponse>(`/api/exchange-rates?base=${baseCurrency}`),
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!me?.companyId,
  });
}

/**
 * Convert an amount from one currency to the base currency.
 * Amount is in cents, returns cents in base currency.
 */
export function convertToBase(
  amountCents: number,
  fromCurrency: string,
  baseCurrency: string,
  rates: Record<string, number> | undefined
): number {
  if (!rates || fromCurrency === baseCurrency) return amountCents;

  // rates[X] = how many X per 1 base unit
  // So to convert FROM X to base: amount / rate
  const rate = rates[fromCurrency];
  if (!rate) return amountCents; // Can't convert, return as-is

  return Math.round(amountCents / rate);
}
