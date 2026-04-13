import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/mock-data";
import { useExpenseCategories, getCategoryIcon, iconOptions } from "@/contexts/ExpenseCategoriesContext";
import { useExpenses, useCreateExpense, useUpdateExpense } from "@/hooks/useExpenses";
import { useMe } from "@/hooks/useMe";
import { useExchangeRates, convertToBase } from "@/hooks/useExchangeRates";
import { ExpenseDetailViewer } from "@/components/ExpenseDetailViewer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Receipt,
  Plus,
  TrendingDown,
  Calendar,
  Tag,
  Search,
  Check,
  X,
  Paperclip,
  CheckCircle2,
  XCircle,
  Clock,
  BadgeCheck,
} from "lucide-react";

type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'reimbursed';

const statusStyle: Record<string, string> = {
  approved: 'bg-green-500/10 text-green-600',
  pending: 'bg-amber-500/10 text-amber-600',
  rejected: 'bg-red-500/10 text-red-600',
  reimbursed: 'bg-indigo-900 text-white',
};

const statusIcon: Record<string, typeof Check> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  reimbursed: BadgeCheck,
};

// --- Add Expense Modal ---
function AddExpenseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { categories } = useExpenseCategories();
  const createMutation = useCreateExpense();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]?.name || "Other");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSave = async () => {
    if (!description || !amount) {
      toast.error("Please fill in description and amount");
      return;
    }
    try {
      await createMutation.mutateAsync({
        description,
        amount: Math.round(parseFloat(amount) * 100),
        category,
        date: new Date(date).toISOString(),
      });
      toast.success("Expense added");
      onClose();
      setDescription("");
      setAmount("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add expense");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was this expense for?" />
          </div>
          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input type="number" className="pl-7 font-mono" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                return (
                  <button key={cat.id} onClick={() => setCategory(cat.name)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                      category === cat.name ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:bg-accent"
                    )}>
                    <Icon className="w-3.5 h-3.5" /> {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Add Expense"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Page ---
export default function ExpensesPage() {
  const { categories } = useExpenseCategories();
  const { data: expenses = [], isLoading } = useExpenses();
  const updateMutation = useUpdateExpense();
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('package');
  const { addCategory } = useExpenseCategories();
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { data: me } = useMe();
  const { data: ratesData } = useExchangeRates();
  const baseCurrency = me?.company?.currency || "USD";
  const rates = ratesData?.rates;

  const categoryIconMap = Object.fromEntries(categories.map((c) => [c.name, c.icon]));
  const getIcon = (name: string) => getCategoryIcon(categoryIconMap[name] || 'package');

  const filtered = expenses.filter((e) => {
    if (filterCategory !== 'All' && e.category !== filterCategory) return false;
    if (search && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalExpenses = expenses.reduce((s, e) => s + convertToBase(e.amount, e.currency, baseCurrency, rates), 0);
  const pendingCount = expenses.filter((e) => e.status === 'pending').length;
  const now = new Date();
  const thisMonth = expenses
    .filter((e) => { const d = new Date(e.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
    .reduce((s, e) => s + convertToBase(e.amount, e.currency, baseCurrency, rates), 0);

  const getUserName = (e: (typeof expenses)[0]) => e.user ? `${e.user.firstName} ${e.user.lastName}` : "Unknown";

  const handleUpdateStatus = async (id: string, status: ExpenseStatus) => {
    try {
      await updateMutation.mutateAsync({ id, status });
      toast.success(`Expense ${status}`);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to update"); }
  };

  const handleReimburse = async (id: string, fileName?: string) => {
    try {
      await updateMutation.mutateAsync({ id, status: "reimbursed", reimbursementFile: fileName });
      toast.success("Marked as reimbursed");
      setSelectedExpenseId(null);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to update"); }
  };

  const selectedExpense = expenses.find((e) => e.id === selectedExpenseId);

  return (
    <AppLayout title="Expenses">
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-primary" /></div>
                <p className="text-sm text-muted-foreground font-medium">Total Expenses</p>
              </div>
              <p className="text-3xl font-bold font-mono">{isLoading ? "..." : formatCurrency(totalExpenses / 100, baseCurrency)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center"><Calendar className="w-5 h-5 text-accent-foreground" /></div>
                <p className="text-sm text-muted-foreground font-medium">This Month</p>
              </div>
              <p className="text-3xl font-bold font-mono">{isLoading ? "..." : formatCurrency(thisMonth / 100, baseCurrency)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Tag className="w-5 h-5 text-amber-600" /></div>
                <p className="text-sm text-muted-foreground font-medium">Pending Review</p>
              </div>
              <p className="text-3xl font-bold">{pendingCount} <span className="text-lg font-medium text-muted-foreground">items</span></p>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses..."
                className="pl-9 pr-4 py-2 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 w-60" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button onClick={() => setFilterCategory('All')}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", filterCategory === 'All' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
                All
              </button>
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                return (
                  <button key={cat.id} onClick={() => setFilterCategory(cat.name)}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all", filterCategory === cat.name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
                    <Icon className="w-3.5 h-3.5" /> {cat.name}
                  </button>
                );
              })}
              {!quickAddOpen ? (
                <button onClick={() => setQuickAddOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:text-foreground border border-dashed border-border transition-all">+ Category</button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <select value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)} className="h-8 rounded-lg bg-muted border border-border text-xs px-2">
                    {iconOptions.map(key => (<option key={key} value={key}>{key}</option>))}
                  </select>
                  <input type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Name"
                    className="w-24 px-2 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30" autoFocus />
                  <button onClick={() => { if (newCatName.trim()) { addCategory(newCatName.trim(), newCatIcon); setNewCatName(''); setQuickAddOpen(false); } }}
                    className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { setQuickAddOpen(false); setNewCatName(''); }}
                    className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
                </div>
              )}
            </div>
          </div>
          <Button onClick={() => setAddModalOpen(true)}><Plus className="w-4 h-4 mr-1.5" /> Add Expense</Button>
        </div>

        {/* Expenses list */}
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {isLoading ? (
              <div className="p-10 text-center text-muted-foreground">Loading expenses...</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                <Receipt className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">{expenses.length === 0 ? 'No expenses yet. Upload a receipt or click "Add Expense".' : "No expenses match your filters"}</p>
              </div>
            ) : (
              filtered.map((expense) => {
                const CatIcon = getIcon(expense.category);
                const SIcon = statusIcon[expense.status] || Clock;
                return (
                  <div key={expense.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedExpenseId(expense.id)}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0"><CatIcon className="w-5 h-5 text-muted-foreground" /></div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{expense.description}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">{getUserName(expense)}</span>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</span>
                          {expense.receiptId && (
                            <>
                              <span className="text-xs text-muted-foreground">·</span>
                              <span className="flex items-center gap-1 text-[10px] text-primary font-medium"><Paperclip className="w-3 h-3" /> Receipt</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={cn("flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium capitalize", statusStyle[expense.status])}>
                        <SIcon className="w-3 h-3" />{expense.status}
                      </span>
                      <p className="text-sm font-semibold font-mono w-24 text-right">{formatCurrency(expense.amount / 100)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <AddExpenseModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />

      {selectedExpense && (
        <ExpenseDetailViewer
          expense={selectedExpense}
          onClose={() => setSelectedExpenseId(null)}
          onUpdateStatus={handleUpdateStatus}
          onReimburse={handleReimburse}
          convertedAmount={convertToBase(selectedExpense.amount, selectedExpense.currency, baseCurrency, rates)}
          baseCurrency={baseCurrency}
        />
      )}
    </AppLayout>
  );
}
