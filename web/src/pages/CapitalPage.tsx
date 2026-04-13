import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { contributionCategories, currencies, formatCurrency } from "@/lib/mock-data";
import { useCapitalContributions, useCreateContribution } from "@/hooks/useCapital";
import { useMe } from "@/hooks/useMe";
import { useExchangeRates, convertToBase } from "@/hooks/useExchangeRates";
import { CapitalDetailViewer } from "@/components/CapitalDetailViewer";
import { Plus, Search, Paperclip } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CapitalPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [contributorFilter, setContributorFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("cash");
  const [viewContributionId, setViewContributionId] = useState<string | null>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const { data: contributions = [], isLoading } = useCapitalContributions();
  const createMutation = useCreateContribution();
  const { data: me } = useMe();
  const { data: ratesData } = useExchangeRates();
  const baseCurrency = me?.company?.currency || "USD";
  const rates = ratesData?.rates;

  const filtered = contributions.filter((c) => {
    if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
    if (contributorFilter !== "all" && c.contributorId !== contributorFilter) return false;
    return true;
  });

  const total = filtered.reduce((s, c) => s + convertToBase(c.amount, c.currency || baseCurrency, baseCurrency, rates), 0);

  const contributorNames = [...new Map(
    contributions
      .filter((c) => c.contributor)
      .map((c) => [c.contributorId, `${c.contributor!.firstName} ${c.contributor!.lastName}`])
  ).entries()];

  const handleSave = async () => {
    if (!amount || !description) {
      toast.error("Please fill in amount and description");
      return;
    }

    try {
      await createMutation.mutateAsync({
        amount: Math.round(parseFloat(amount) * 100), // Convert dollars to cents
        currency,
        description,
        category: selectedCategory,
        date: new Date(date).toISOString(),
        notes: notes || undefined,
      });
      toast.success("Contribution added successfully");
      setModalOpen(false);
      // Reset form
      setAmount("");
      setDescription("");
      setNotes("");
      setSelectedCategory("cash");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add contribution");
    }
  };

  const getContributorName = (c: (typeof contributions)[0]) =>
    c.contributor ? `${c.contributor.firstName} ${c.contributor.lastName}` : "Unknown";

  return (
    <AppLayout title="Capital Tracking">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div />
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Add Contribution
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[520px]">
              <DialogHeader>
                <DialogTitle>Add Capital Contribution</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        className="pl-7 font-mono"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.slice(0, 3).map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="flex flex-wrap gap-2">
                    {contributionCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat.toLowerCase().replace(/ /g, "_"))}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                          selectedCategory === cat.toLowerCase().replace(/ /g, "_")
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:bg-accent"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Brief description of the contribution"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Receipt (optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Paperclip className="w-5 h-5 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop or click to upload receipt
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      JPG, PNG, HEIC, PDF · Max 10MB
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Textarea
                    placeholder="Additional notes..."
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Saving..." : "Save Contribution"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={contributorFilter} onValueChange={setContributorFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Contributor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contributors</SelectItem>
              {contributorNames.map(([id, name]) => (
                <SelectItem key={id} value={id}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {contributionCategories.map((c) => (
                <SelectItem key={c} value={c.toLowerCase().replace(/ /g, "_")}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" className="shrink-0">
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading contributions...
            </CardContent>
          </Card>
        ) : contributions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No capital contributions yet. Click "Add Contribution" to get started.
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Table — desktop */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Contributor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((c) => (
                      <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setViewContributionId(c.id)}>
                        <TableCell className="text-sm">{new Date(c.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                              {getContributorName(c).charAt(0)}
                            </div>
                            <span className="text-sm">{getContributorName(c)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                            {c.category.replace(/_/g, " ")}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{c.description}</TableCell>
                        <TableCell className="text-right font-mono text-sm text-success font-medium">
                          {formatCurrency(c.amount / 100, c.currency)}
                        </TableCell>
                        <TableCell>
                          {c.receiptId && <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-semibold border-t-2">
                      <TableCell colSpan={4} className="text-right text-sm">Total</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(total / 100, baseCurrency)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Cards — mobile */}
            <div className="md:hidden space-y-3">
              {filtered.map((c) => (
                <Card key={c.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setViewContributionId(c.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {getContributorName(c).charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{getContributorName(c)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(c.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-semibold text-success">
                          {formatCurrency(c.amount / 100, c.currency)}
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                          {c.category.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="text-center py-2">
                <p className="text-sm font-semibold">Total: {formatCurrency(total / 100, baseCurrency)}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Contribution Detail Viewer */}
      {viewContributionId && (() => {
        const c = contributions.find((x) => x.id === viewContributionId);
        return c ? (
          <CapitalDetailViewer
            contribution={c}
            onClose={() => setViewContributionId(null)}
          />
        ) : null;
      })()}
    </AppLayout>
  );
}
