import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  X,
  Upload,
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

const statusIcon: Record<string, typeof CheckCircle2> = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  reimbursed: BadgeCheck,
};

type ExpenseData = {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  status: string;
  receiptId: string | null;
  reimbursementFile: string | null;
  notes: string | null;
  user?: { id: string; firstName: string; lastName: string; email: string } | null;
  receipt?: { id: string; imageUrl: string; status: string; extractedData: Record<string, unknown> | null } | null;
};

type Props = {
  expense: ExpenseData;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ExpenseStatus) => void;
  onReimburse: (id: string, fileName?: string) => void;
  /** Optional: show a converted amount in the company's base currency */
  convertedAmount?: number;
  baseCurrency?: string;
};

export function ExpenseDetailViewer({
  expense,
  onClose,
  onUpdateStatus,
  onReimburse,
  convertedAmount,
  baseCurrency,
}: Props) {
  const [reimbursementFileName, setReimbursementFileName] = useState(expense.reimbursementFile || '');
  const hasReceiptImage = expense.receipt?.imageUrl?.startsWith("data:");
  const StatusBadge = statusIcon[expense.status] || Clock;
  const submittedBy = expense.user ? `${expense.user.firstName} ${expense.user.lastName}` : "Unknown";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className={cn(
        "relative bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex",
        hasReceiptImage
          ? "w-full h-full max-w-[calc(100vw-48px)] max-h-[calc(100vh-48px)]"
          : "w-full max-w-lg max-h-[calc(100vh-48px)]"
      )}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Receipt image/PDF */}
        {hasReceiptImage && (
          <div className="flex-1 flex items-center justify-center bg-muted/30 overflow-auto p-6">
            {expense.receipt!.imageUrl.startsWith("data:application/pdf") ? (
              <iframe src={expense.receipt!.imageUrl} className="w-full h-full rounded-lg shadow-lg border-0" title="Receipt PDF" />
            ) : (
              <img src={expense.receipt!.imageUrl} alt="Receipt" className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
            )}
          </div>
        )}

        {/* Details panel */}
        <div className={cn(
          "bg-card flex flex-col h-full overflow-y-auto shrink-0",
          hasReceiptImage ? "w-[400px] border-l border-border" : "w-full"
        )}>
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Expense Details</h2>
            <p className="text-xs text-muted-foreground mt-1">{submittedBy} · {new Date(expense.date).toLocaleDateString()}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className={cn("inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium capitalize", statusStyle[expense.status])}>
                <StatusBadge className="w-3.5 h-3.5" />
                {expense.status}
              </span>
              {expense.receiptId && (
                <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                  <Paperclip className="w-3 h-3" /> Receipt attached
                </span>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="px-6 py-4 bg-primary/5 border-b border-border">
            <p className="text-xs text-muted-foreground font-medium mb-1">Amount</p>
            <p className="text-3xl font-bold font-mono">{formatCurrency(expense.amount / 100, expense.currency)}</p>
            {convertedAmount !== undefined && baseCurrency && expense.currency !== baseCurrency && (
              <p className="text-sm text-muted-foreground font-mono mt-1">
                ≈ {formatCurrency(convertedAmount / 100, baseCurrency)} <span className="text-xs">(converted)</span>
              </p>
            )}
          </div>

          {/* Info */}
          <div className="p-6 space-y-4 flex-1">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Description</p>
              <p className="text-sm mt-1 font-medium">{expense.description}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Category</p>
              <p className="text-sm mt-1 capitalize">{expense.category}</p>
            </div>

            {/* Status actions */}
            {expense.status === 'pending' && (
              <div className="space-y-2 pt-2">
                <Label className="text-xs font-medium">Update Status</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateStatus(expense.id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500/10 text-green-600 font-medium text-sm hover:bg-green-500/20 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => onUpdateStatus(expense.id, 'rejected')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-600 font-medium text-sm hover:bg-red-500/20 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            )}

            {expense.status === 'rejected' && (
              <div className="pt-2">
                <button
                  onClick={() => onUpdateStatus(expense.id, 'pending')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-muted text-foreground font-medium text-sm hover:bg-accent transition-colors"
                >
                  <Clock className="w-4 h-4" /> Move Back to Pending
                </button>
              </div>
            )}

            {expense.status === 'approved' && (
              <div className="space-y-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-green-600" />
                  <Label className="text-xs font-medium text-green-700">Mark as Reimbursed</Label>
                </div>
                <label className="flex items-center justify-center gap-3 py-4 rounded-xl border-2 border-dashed border-green-500/30 hover:border-green-500/50 cursor-pointer transition-colors bg-card">
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && setReimbursementFileName(e.target.files[0].name)} />
                  {reimbursementFileName ? (
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{reimbursementFileName}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Upload transfer proof</span>
                    </>
                  )}
                </label>
                <Button onClick={() => onReimburse(expense.id, reimbursementFileName || undefined)} className="w-full">
                  <BadgeCheck className="w-4 h-4 mr-1.5" /> Mark as Reimbursed
                </Button>
              </div>
            )}

            {expense.status === 'reimbursed' && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <BadgeCheck className="w-5 h-5 text-primary" />
                  <p className="text-sm font-semibold">Reimbursed</p>
                </div>
                {expense.reimbursementFile && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{expense.reimbursementFile}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
