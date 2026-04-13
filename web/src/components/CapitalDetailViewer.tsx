import { formatCurrency } from "@/lib/mock-data";
import { X, DollarSign, Calendar, Tag, User, FileText, Paperclip } from "lucide-react";

type ContributionData = {
  id: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
  notes?: string | null;
  receiptId?: string | null;
  createdAt: string;
  contributor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

type CapitalDetailViewerProps = {
  contribution: ContributionData;
  onClose: () => void;
};

export function CapitalDetailViewer({ contribution, onClose }: CapitalDetailViewerProps) {
  const contributorName = contribution.contributor
    ? `${contribution.contributor.firstName} ${contribution.contributor.lastName}`
    : "Unknown";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[calc(100vh-48px)] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Capital Contribution</h2>
              <p className="text-xs text-muted-foreground">Added {new Date(contribution.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="px-6 py-4 bg-primary/5 border-y border-border">
          <p className="text-xs text-muted-foreground font-medium mb-1">Amount</p>
          <p className="text-3xl font-bold font-mono text-primary">
            {formatCurrency(contribution.amount / 100, contribution.currency)}
          </p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Description</p>
              <p className="text-sm mt-1">{contribution.description}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Contributor</p>
              <p className="text-sm mt-1">{contributorName}</p>
              {contribution.contributor?.email && (
                <p className="text-xs text-muted-foreground">{contribution.contributor.email}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Tag className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Category</p>
              <p className="text-sm mt-1 capitalize">{contribution.category.replace(/_/g, " ")}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground font-medium">Date</p>
              <p className="text-sm mt-1">{new Date(contribution.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>

          {contribution.notes && (
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Notes</p>
                <p className="text-sm mt-1">{contribution.notes}</p>
              </div>
            </div>
          )}

          {contribution.receiptId && (
            <div className="flex items-start gap-3">
              <Paperclip className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Receipt</p>
                <p className="text-sm mt-1 text-primary">Attached</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
