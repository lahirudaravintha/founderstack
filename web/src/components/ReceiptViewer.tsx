import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Note: Select still used for category dropdowns
import { contributionCategories, formatCurrency } from "@/lib/mock-data";
import { CurrencySelect } from "@/components/CurrencySelect";
import { useMe } from "@/hooks/useMe";
import { X, CheckCircle, AlertTriangle, Paperclip, FileText, XCircle, Pencil } from "lucide-react";

type ReceiptData = {
  id: string;
  imageUrl: string;
  status: string;
  createdAt: string;
  extractedData: {
    vendorName?: string;
    totalAmount?: number;
    currency?: string;
    date?: string;
    category?: string;
    confidence?: number;
  } | null;
  expense?: {
    id: string;
    status: string;
  } | null;
};

type ReceiptViewerProps = {
  receipt: ReceiptData;
  onClose: () => void;
  onSaveAsContribution?: (data: {
    vendor: string;
    amount: string;
    currency: string;
    date: string;
    category: string;
  }) => Promise<void>;
  onSaveManualExpense?: (data: {
    vendor: string;
    amount: string;
    currency: string;
    date: string;
    category: string;
    description: string;
  }) => Promise<void>;
  /** Admin-only: correct OCR-extracted fields without rejecting the receipt. */
  onSaveOcrEdits?: (data: {
    vendor: string;
    amount: string;
    currency: string;
    date: string;
    category: string;
  }) => Promise<void>;
  saving?: boolean;
};

const expenseCategories = ["Software", "Hardware", "Travel", "Office", "Marketing", "Food", "Transport", "Utilities", "Professional Services", "Other"];

export function ReceiptViewer({ receipt, onClose, onSaveAsContribution, onSaveManualExpense, onSaveOcrEdits, saving }: ReceiptViewerProps) {
  const { data: me } = useMe();
  const baseCurrency = me?.company?.currency || "USD";
  const isAdmin = me?.role === "owner" || me?.role === "admin";
  const canCorrectOcr = isAdmin && Boolean(onSaveOcrEdits);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showOcrEditForm, setShowOcrEditForm] = useState(false);
  const [vendor, setVendor] = useState(receipt.extractedData?.vendorName || "");
  const [amount, setAmount] = useState(receipt.extractedData?.totalAmount ? String(receipt.extractedData.totalAmount / 100) : "");
  const [currency, setCurrency] = useState(receipt.extractedData?.currency || baseCurrency);
  const [date, setDate] = useState(receipt.extractedData?.date || new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState(receipt.extractedData?.category || "");
  const [description, setDescription] = useState("");

  const handleStartOcrEdit = () => {
    // Reset form to current OCR values
    setVendor(receipt.extractedData?.vendorName || "");
    setAmount(receipt.extractedData?.totalAmount ? String(receipt.extractedData.totalAmount / 100) : "");
    setCurrency(receipt.extractedData?.currency || baseCurrency);
    setDate(receipt.extractedData?.date || new Date().toISOString().split("T")[0]);
    setCategory(receipt.extractedData?.category || "");
    setShowOcrEditForm(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full h-full max-w-[calc(100vw-48px)] max-h-[calc(100vh-48px)] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Receipt image/PDF */}
        <div className="flex-1 flex items-center justify-center bg-muted/30 overflow-auto p-6">
          {receipt.imageUrl?.startsWith("data:application/pdf") ? (
            <iframe
              src={receipt.imageUrl}
              className="w-full h-full rounded-lg shadow-lg border-0"
              title="Receipt PDF"
            />
          ) : receipt.imageUrl?.startsWith("data:image") ? (
            <img src={receipt.imageUrl} alt="Receipt" className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
          ) : (
            <div className="text-center text-muted-foreground">
              <Paperclip className="w-16 h-16 mx-auto mb-4" />
              <p>No preview available</p>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="w-[380px] bg-card border-l border-border flex flex-col h-full overflow-y-auto shrink-0">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Receipt Details</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Uploaded {new Date(receipt.createdAt).toLocaleString()}
            </p>
            <div className="mt-3">
              {receipt.status === "confirmed" ? (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                </span>
              ) : receipt.status === "failed" ? (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 font-medium">
                  <XCircle className="w-3.5 h-3.5" /> Recognition Failed
                </span>
              ) : receipt.status === "reviewed" ? (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" /> Needs Review
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" /> Processing
                </span>
              )}
            </div>
          </div>

          {/* Failed state */}
          {receipt.status === "failed" && !showManualForm && !showEditForm && (
            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-base font-semibold mb-2">Couldn't identify this document</h3>
              <p className="text-sm text-muted-foreground mb-6">
                We were unable to recognize this as a receipt or extract any data from it. You can enter the details manually below.
              </p>
              {(onSaveManualExpense || onSaveAsContribution) && (
                <Button className="w-full" onClick={() => setShowManualForm(true)}>
                  Enter Details Manually
                </Button>
              )}
            </div>
          )}

          {/* Manual entry form (for failed receipts) */}
          {showManualForm && (onSaveManualExpense || onSaveAsContribution) && (
            <div className="p-6 space-y-4 flex-1">
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 mb-2">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Manual entry — fill in the details from your receipt</p>
              </div>
              <div className="space-y-2">
                <Label>Vendor / Merchant</Label>
                <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g. Amazon, Uber, Starbucks" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was this expense for?" />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input type="number" step="0.01" className="pl-7 font-mono" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                  <CurrencySelect value={currency} onValueChange={setCurrency} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((c) => (
                      <SelectItem key={c} value={c.toLowerCase().replace(/ /g, "_")}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowManualForm(false)}>Cancel</Button>
                <Button
                  className="flex-1"
                  disabled={saving || !vendor || !amount}
                  onClick={() => {
                    if (onSaveManualExpense) {
                      onSaveManualExpense({ vendor, amount, currency, date, category: category || "other", description: description || vendor });
                    } else if (onSaveAsContribution) {
                      onSaveAsContribution({ vendor, amount, currency, date, category: category || "other" });
                    }
                  }}
                >
                  {saving ? "Saving..." : "Save Expense"}
                </Button>
              </div>
            </div>
          )}

          {/* Summary view (for successfully extracted data) */}
          {receipt.extractedData && receipt.status !== "failed" && !showEditForm && !showManualForm && !showOcrEditForm && (
            <div className="p-6 space-y-4 flex-1">
              {canCorrectOcr && (
                <div className="flex justify-end -mb-2">
                  <button
                    onClick={handleStartOcrEdit}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-accent transition-colors"
                    title="Correct OCR-extracted fields"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground font-medium">Vendor</p>
                <p className="text-sm font-semibold mt-1">{receipt.extractedData.vendorName || "Unknown"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Amount</p>
                <p className="text-2xl font-bold font-mono mt-1">
                  {receipt.extractedData.totalAmount
                    ? formatCurrency(receipt.extractedData.totalAmount / 100, receipt.extractedData.currency || baseCurrency)
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Date</p>
                <p className="text-sm mt-1">{receipt.extractedData.date || "Unknown"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Category</p>
                <p className="text-sm mt-1 capitalize">{(receipt.extractedData.category || "other").replace(/_/g, " ")}</p>
              </div>
              {receipt.extractedData.confidence !== undefined && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium">OCR Confidence</p>
                  <p className="text-sm mt-1">{Math.round((receipt.extractedData.confidence as number) * 100)}%</p>
                </div>
              )}

              {receipt.status !== "confirmed" && onSaveAsContribution && (
                <div className="pt-4">
                  <Button className="w-full" onClick={() => setShowEditForm(true)}>
                    Edit & Save as Contribution
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* OCR correction form (admin) */}
          {showOcrEditForm && onSaveOcrEdits && (
            <div className="p-6 space-y-4 flex-1">
              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 mb-2">
                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Correct any OCR mistakes — your edits update both the receipt and the linked expense.</p>
              </div>
              <div className="space-y-2">
                <Label>Vendor / Merchant</Label>
                <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g. Amazon, Uber, Starbucks" />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input type="number" step="0.01" className="pl-7 font-mono" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                  <CurrencySelect value={currency} onValueChange={setCurrency} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((c) => (
                      <SelectItem key={c} value={c.toLowerCase().replace(/ /g, "_")}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowOcrEditForm(false)} disabled={saving}>Cancel</Button>
                <Button
                  className="flex-1"
                  disabled={saving || !vendor || !amount}
                  onClick={async () => {
                    await onSaveOcrEdits({ vendor, amount, currency, date, category: category || "other" });
                    setShowOcrEditForm(false);
                  }}
                >
                  {saving ? "Saving..." : "Save corrections"}
                </Button>
              </div>
            </div>
          )}

          {/* Edit form (for contribution from reviewed receipt) */}
          {showEditForm && onSaveAsContribution && (
            <div className="p-6 space-y-4 flex-1">
              <div className="space-y-2">
                <Label>Vendor</Label>
                <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Vendor name" />
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input type="number" className="pl-7 font-mono" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </div>
                  <CurrencySelect value={currency} onValueChange={setCurrency} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {contributionCategories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={() => setShowEditForm(false)}>Cancel</Button>
                <Button className="flex-1" disabled={saving} onClick={() => onSaveAsContribution({ vendor, amount, currency, date, category })}>
                  {saving ? "Saving..." : "Save as Contribution"}
                </Button>
              </div>
            </div>
          )}

          {/* No data (non-failed, just missing extraction) */}
          {!receipt.extractedData && receipt.status !== "failed" && !showEditForm && !showManualForm && !showOcrEditForm && (
            <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground mb-4">No data was extracted from this receipt.</p>
              {onSaveAsContribution ? (
                <Button onClick={() => setShowEditForm(true)}>Enter Details Manually</Button>
              ) : canCorrectOcr ? (
                <Button onClick={handleStartOcrEdit}>Enter Details Manually</Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
