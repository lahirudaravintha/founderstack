import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCompany } from "@/hooks/useCompany";
import { useInvalidateMe } from "@/hooks/useMe";
import { currencyList } from "@/lib/mock-data";
import { toast } from "sonner";
import { Building2, Search } from "lucide-react";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [currencySearch, setCurrencySearch] = useState("");
  const createCompany = useCreateCompany();
  const invalidateMe = useInvalidateMe();
  const navigate = useNavigate();

  const filteredCurrencies = useMemo(() => {
    if (!currencySearch) return currencyList;
    const q = currencySearch.toLowerCase();
    return currencyList.filter(c =>
      c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [currencySearch]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Please enter a company name");
      return;
    }

    try {
      await createCompany.mutateAsync({
        name: name.trim(),
        industry: industry.trim() || undefined,
        currency,
      });
      invalidateMe();
      toast.success("Company created! Welcome to FounderStack.");
      navigate("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create company");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to FounderStack</h1>
          <p className="text-muted-foreground">Let's set up your company to get started.</p>
        </div>

        {/* Form */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Inc."
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="SaaS, E-commerce, Fintech..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <div className="relative">
                <Search className="absolute left-3 top-[11px] w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={currencySearch}
                  onChange={(e) => setCurrencySearch(e.target.value)}
                  placeholder="Search currencies..."
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="max-h-48 overflow-y-auto rounded-md border border-input bg-background">
                {filteredCurrencies.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => { setCurrency(c.code); setCurrencySearch(""); }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-muted transition-colors ${
                      currency === c.code ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                    }`}
                  >
                    <span>{c.code} — {c.name}</span>
                    {currency === c.code && <span className="text-primary text-xs">✓</span>}
                  </button>
                ))}
                {filteredCurrencies.length === 0 && (
                  <p className="px-3 py-4 text-sm text-muted-foreground text-center">No currencies match</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: <span className="font-medium text-foreground">{currency} — {currencyList.find(c => c.code === currency)?.name}</span>
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={createCompany.isPending}
            >
              {createCompany.isPending ? "Setting up..." : "Get Started"}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          You can invite team members after setup.
        </p>
      </div>
    </div>
  );
}
