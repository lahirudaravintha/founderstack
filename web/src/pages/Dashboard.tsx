import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { useCapitalContributions } from "@/hooks/useCapital";
import { useExpenses, useUpdateExpense } from "@/hooks/useExpenses";
import { useMe } from "@/hooks/useMe";
import { useExchangeRates, convertToBase } from "@/hooks/useExchangeRates";
import { ExpenseDetailViewer } from "@/components/ExpenseDetailViewer";
import { formatCurrency } from "@/lib/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Users, CalendarIcon, AlertCircle, Eye, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, subDays, startOfMonth } from "date-fns";
import { toast } from "sonner";


const presets = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 3 months', days: 90 },
  { label: 'Last 12 months', days: 365 },
  { label: 'Month to date', days: -1 },
  { label: 'Quarter to date', days: -2 },
  { label: 'All time', days: 0 },
] as const;

export default function Dashboard() {
  const isMobile = useIsMobile();
  const { data: contributions = [], isLoading } = useCapitalContributions();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { data: me } = useMe();
  const { data: ratesData } = useExchangeRates();
  const updateExpense = useUpdateExpense();

  const baseCurrency = me?.company?.currency || "USD";
  const rates = ratesData?.rates;

  // Pending expenses for review
  const pendingExpenses = expenses.filter(e => e.status === "pending");
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const selectedExpense = expenses.find(e => e.id === selectedExpenseId);

  // Compute summary values — convert all to base currency
  const totalCapital = contributions.reduce((sum, c) => {
    return sum + convertToBase(c.amount, c.currency || baseCurrency, baseCurrency, rates);
  }, 0);

  const now = new Date();
  const thisMonthCapital = contributions
    .filter((c) => {
      const d = new Date(c.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, c) => {
      return sum + convertToBase(c.amount, c.currency || baseCurrency, baseCurrency, rates);
    }, 0);
  const contributorCount = new Set(contributions.map((c) => c.contributorId)).size;

  // Expense totals (approved + reimbursed only)
  const approvedExpenses = expenses.filter(e => e.status === "approved" || e.status === "reimbursed");
  const totalExpenses = approvedExpenses.reduce((sum, e) => {
    return sum + convertToBase(e.amount, e.currency, baseCurrency, rates);
  }, 0);
  const thisMonthExpenses = approvedExpenses
    .filter((e) => {
      const d = new Date(e.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => {
      return sum + convertToBase(e.amount, e.currency, baseCurrency, rates);
    }, 0);

  // Build chart data from contributions (converted to base currency)
  const contribReimbData = Object.values(
    contributions.reduce((acc, c) => {
      const name = c.contributor ? `${c.contributor.firstName} ${c.contributor.lastName}` : "Unknown";
      if (!acc[name]) acc[name] = { name, Contributed: 0, Reimbursed: 0 };
      acc[name].Contributed += convertToBase(c.amount, c.currency || baseCurrency, baseCurrency, rates);
      return acc;
    }, {} as Record<string, { name: string; Contributed: number; Reimbursed: number }>)
  );

  const [activePreset, setActivePreset] = useState('All time');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [tempRange, setTempRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [popoverOpen, setPopoverOpen] = useState(false);


  const handlePreset = (label: string, days: number) => {
    setActivePreset(label);
    const now = new Date();
    if (days === 0) {
      setTempRange({ from: undefined, to: undefined });
    } else if (days === -1) {
      setTempRange({ from: startOfMonth(now), to: now });
    } else if (days === -2) {
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      setTempRange({ from: quarterStart, to: now });
    } else {
      setTempRange({ from: subDays(now, days), to: now });
    }
  };

  const handleSetDate = () => {
    setDateRange(tempRange);
    setPopoverOpen(false);
  };

  const handleCancel = () => {
    setTempRange(dateRange);
    setActivePreset(dateRange.from ? '' : 'All time');
    setPopoverOpen(false);
  };

  const rangeLabel = dateRange.from && dateRange.to
    ? `${format(dateRange.from, 'MM/dd/yyyy')} – ${format(dateRange.to, 'MM/dd/yyyy')}`
    : 'Date range';

  const handleUpdateStatus = async (id: string, status: "pending" | "approved" | "rejected" | "reimbursed") => {
    try {
      await updateExpense.mutateAsync({ id, status });
      toast.success(`Expense ${status}`);
      setSelectedExpenseId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleReimburse = async (id: string, fileName?: string) => {
    try {
      await updateExpense.mutateAsync({ id, status: "reimbursed", reimbursementFile: fileName });
      toast.success("Marked as reimbursed");
      setSelectedExpenseId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        {/* Pending Review Banner */}
        {pendingExpenses.length > 0 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {pendingExpenses.length} expense{pendingExpenses.length > 1 ? "s" : ""} pending review
                  </h3>
                  <p className="text-xs text-muted-foreground">New submissions require your approval</p>
                </div>
              </div>

              <div className="space-y-2">
                {pendingExpenses.slice(0, 5).map((expense) => {
                  const userName = expense.user ? `${expense.user.firstName} ${expense.user.lastName}` : "Unknown";
                  const converted = convertToBase(expense.amount, expense.currency, baseCurrency, rates);
                  const showConverted = expense.currency !== baseCurrency && rates;

                  return (
                    <div
                      key={expense.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-amber-500/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedExpenseId(expense.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{expense.description}</p>
                          {expense.receiptId && (
                            <Paperclip className="w-3 h-3 text-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {userName} · {new Date(expense.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold font-mono">
                          {formatCurrency(expense.amount / 100, expense.currency)}
                        </p>
                        {showConverted && (
                          <p className="text-[10px] text-muted-foreground font-mono">
                            ≈ {formatCurrency(converted / 100, baseCurrency)}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-1.5 text-amber-600 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-700 opacity-80 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExpenseId(expense.id);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </Button>
                    </div>
                  );
                })}

                {pendingExpenses.length > 5 && (
                  <p className="text-xs text-center text-muted-foreground pt-1">
                    + {pendingExpenses.length - 5} more pending
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Time range selector */}
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <Popover open={popoverOpen} onOpenChange={(open) => {
            setPopoverOpen(open);
            if (open) {
              setTempRange(dateRange);
              setActivePreset(dateRange.from ? '' : 'All time');
            }
          }}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 text-sm border-primary text-primary">
                <CalendarIcon className="w-4 h-4" />
                {rangeLabel}
                <svg className={cn("w-3 h-3 transition-transform", popoverOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
              <div className="flex pointer-events-auto">
                {/* Presets sidebar */}
                <div className="border-r border-border p-2 min-w-[160px] flex flex-col gap-0.5">
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => handlePreset(p.label, p.days)}
                      className={cn(
                        "px-3 py-2 text-sm text-left rounded-md transition-colors",
                        activePreset === p.label
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {/* Calendar + footer */}
                <div className="flex flex-col">
                  <Calendar
                    mode="range"
                    selected={tempRange.from && tempRange.to ? { from: tempRange.from, to: tempRange.to } : undefined}
                    onSelect={(range) => {
                      setTempRange({ from: range?.from, to: range?.to });
                      if (range?.from && range?.to) setActivePreset('');
                    }}
                    numberOfMonths={2}
                    className="p-3 pointer-events-auto"
                  />
                  <div className="border-t border-border px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="border border-border rounded-md px-3 py-1.5 font-mono text-xs min-w-[110px] text-center">
                        {tempRange.from ? format(tempRange.from, 'MM / dd / yyyy') : '-- / -- / ----'}
                      </div>
                      <span className="text-muted-foreground">›</span>
                      <div className="border border-border rounded-md px-3 py-1.5 font-mono text-xs min-w-[110px] text-center">
                        {tempRange.to ? format(tempRange.to, 'MM / dd / yyyy') : '-- / -- / ----'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
                      <Button size="sm" onClick={handleSetDate}>Set date</Button>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Total Capital</p>
              </div>
              <p className="text-3xl font-bold font-mono">{isLoading ? "..." : formatCurrency(totalCapital / 100, baseCurrency)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Total Expenses</p>
              </div>
              <p className="text-3xl font-bold font-mono">{expensesLoading ? "..." : formatCurrency(totalExpenses / 100, baseCurrency)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-info" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">This Month</p>
              </div>
              <p className="text-3xl font-bold font-mono">{isLoading ? "..." : formatCurrency((thisMonthCapital - thisMonthExpenses) / 100, baseCurrency)}</p>
              {thisMonthExpenses > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  +{formatCurrency(thisMonthCapital / 100, baseCurrency)} capital · -{formatCurrency(thisMonthExpenses / 100, baseCurrency)} expenses
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-success" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">Contributors</p>
              </div>
              <p className="text-3xl font-bold">{isLoading ? "..." : contributorCount} <span className="text-lg font-medium text-muted-foreground">founders</span></p>
            </CardContent>
          </Card>
        </div>

        {/* Contributions vs Reimbursements bar chart */}
        {contribReimbData.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-base font-semibold mb-4">Capital by Contributor</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contribReimbData} barGap={8} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 13 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => formatCurrency(v / 100, baseCurrency)} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value: number) => formatCurrency(value / 100, baseCurrency)} cursor={{ fill: 'hsl(var(--muted) / 0.4)' }} />
                  <Bar dataKey="Contributed" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-base font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {contributions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">No activity yet</p>
              ) : (
                contributions.slice(0, 5).map((c) => {
                  const name = c.contributor ? `${c.contributor.firstName} ${c.contributor.lastName}` : "Unknown";
                  const converted = convertToBase(c.amount, c.currency || baseCurrency, baseCurrency, rates);
                  const showConverted = (c.currency || baseCurrency) !== baseCurrency && rates;

                  return (
                    <div key={c.id} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-primary">{name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{name}</span>{' '}
                          <span className="text-muted-foreground">
                            added {formatCurrency(c.amount / 100, c.currency || baseCurrency)}
                            {showConverted && (
                              <span className="text-xs"> (≈ {formatCurrency(converted / 100, baseCurrency)})</span>
                            )}
                            {' '}({c.category.replace(/_/g, ' ')})
                          </span>
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{new Date(c.date).toLocaleDateString()}</span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Expense Detail Popup */}
      {selectedExpense && (
        <ExpenseDetailViewer
          expense={selectedExpense}
          onClose={() => setSelectedExpenseId(null)}
          onUpdateStatus={handleUpdateStatus}
          onReimburse={handleReimburse}
          onSaveEdits={async (id, edits) => {
            await updateExpense.mutateAsync({ id, ...edits });
          }}
          convertedAmount={convertToBase(selectedExpense.amount, selectedExpense.currency, baseCurrency, rates)}
          baseCurrency={baseCurrency}
        />
      )}
    </AppLayout>
  );
}
