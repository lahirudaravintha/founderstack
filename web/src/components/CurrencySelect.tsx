import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currencyList } from "@/lib/mock-data";
import { useMe } from "@/hooks/useMe";

type CurrencySelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

export function CurrencySelect({ value, onValueChange, className = "w-24" }: CurrencySelectProps) {
  const { data: me } = useMe();
  const baseCurrency = me?.company?.currency || "USD";

  // Put base currency first, then the rest (without duplicating it)
  const sortedCurrencies = useMemo(() => {
    const base = currencyList.find(c => c.code === baseCurrency);
    const rest = currencyList.filter(c => c.code !== baseCurrency);
    return base ? [base, ...rest] : currencyList;
  }, [baseCurrency]);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}><SelectValue /></SelectTrigger>
      <SelectContent className="max-h-[280px]">
        {sortedCurrencies.map((c, i) => (
          <SelectItem key={c.code} value={c.code}>
            {c.code}
            <span className="text-muted-foreground ml-1 text-xs hidden sm:inline">
              {c.name}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
