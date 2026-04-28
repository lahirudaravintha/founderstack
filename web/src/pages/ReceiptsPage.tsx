import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useReceipts, useUpdateReceipt } from "@/hooks/useReceipts";
import { ReceiptViewer } from "@/components/ReceiptViewer";
import { CheckCircle, AlertTriangle, Clock, Paperclip, ZoomIn, FileText, XCircle } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/mock-data";
import { useMe } from "@/hooks/useMe";
import { toast } from "sonner";

export default function ReceiptsPage() {
  const { data: me } = useMe();
  const baseCurrency = me?.company?.currency || "USD";
  const [viewReceiptId, setViewReceiptId] = useState<string | null>(null);
  const { data: receipts = [], isLoading } = useReceipts();
  const updateReceipt = useUpdateReceipt();
  const viewingReceipt = receipts.find((r) => r.id === viewReceiptId);

  const getStatusBadge = (receipt: (typeof receipts)[0]) => {
    const expenseStatus = (receipt as any).expense?.status;
    if (expenseStatus === "approved" || expenseStatus === "reimbursed") {
      return <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium"><CheckCircle className="w-4 h-4" /> Approved</span>;
    }
    if (expenseStatus === "rejected") {
      return <span className="flex items-center gap-1.5 text-xs text-red-600 font-medium"><AlertTriangle className="w-4 h-4" /> Rejected</span>;
    }
    if (expenseStatus === "pending") {
      return <span className="flex items-center gap-1.5 text-xs text-amber-600 font-medium"><Clock className="w-4 h-4" /> Pending Approval</span>;
    }
    if (receipt.status === "processing") {
      return <span className="flex items-center gap-1.5 text-xs text-blue-600 font-medium"><Clock className="w-4 h-4" /> Processing</span>;
    }
    if (receipt.status === "failed") {
      return <span className="flex items-center gap-1.5 text-xs text-red-600 font-medium"><XCircle className="w-4 h-4" /> Recognition Failed</span>;
    }
    return <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium"><Clock className="w-4 h-4" /> Uploaded</span>;
  };

  return (
    <AppLayout title="Receipts">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Receipt History</h2>
          <p className="text-sm text-muted-foreground">All receipts uploaded to your account. Click to view full size.</p>
        </div>

        {isLoading ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Loading receipts...</CardContent></Card>
        ) : receipts.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No receipts uploaded yet. Upload receipts from the Founder Portal or Expenses page.</CardContent></Card>
        ) : (
          <div className="grid gap-3">
            {receipts.map((receipt) => (
              <Card key={receipt.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setViewReceiptId(receipt.id)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {receipt.imageUrl.startsWith("data:image") ? (
                      <img src={receipt.imageUrl} alt="Receipt" className="w-full h-full object-cover" />
                    ) : receipt.imageUrl.startsWith("data:application/pdf") ? (
                      <FileText className="w-6 h-6 text-red-500" />
                    ) : (
                      <Paperclip className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {receipt.extractedData?.vendorName || "Receipt"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {receipt.extractedData?.totalAmount
                        ? formatCurrency(receipt.extractedData.totalAmount / 100, receipt.extractedData.currency || baseCurrency)
                        : "—"}{" "}
                      · {new Date(receipt.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ZoomIn className="w-4 h-4 text-muted-foreground" />
                    {getStatusBadge(receipt)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen viewer with manual entry for failed receipts */}
      {viewingReceipt && (
        <ReceiptViewer
          receipt={viewingReceipt}
          onClose={() => setViewReceiptId(null)}
          onSaveOcrEdits={async (data) => {
            if (!data.vendor || !data.amount) {
              toast.error("Please fill in vendor and amount");
              return;
            }
            try {
              const amountCents = Math.round(parseFloat(data.amount) * 100);
              await updateReceipt.mutateAsync({
                id: viewingReceipt.id,
                status: "reviewed",
                extractedData: {
                  ...(viewingReceipt.extractedData || {}),
                  vendorName: data.vendor,
                  totalAmount: amountCents,
                  currency: data.currency,
                  date: data.date,
                  category: data.category,
                },
                expenseData: {
                  description: data.vendor,
                  amount: amountCents,
                  currency: data.currency,
                  category: data.category,
                  date: new Date(data.date).toISOString(),
                },
              } as any);
              toast.success("Receipt corrections saved");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed to save");
            }
          }}
          onSaveManualExpense={viewingReceipt.status === "failed" ? async (data) => {
            if (!data.vendor || !data.amount) {
              toast.error("Please fill in vendor and amount");
              return;
            }
            try {
              const amountCents = Math.round(parseFloat(data.amount) * 100);
              await updateReceipt.mutateAsync({
                id: viewingReceipt.id,
                status: "reviewed",
                extractedData: {
                  vendorName: data.vendor,
                  totalAmount: amountCents,
                  currency: data.currency,
                  date: data.date,
                  category: data.category,
                },
                expenseData: {
                  description: data.description || data.vendor,
                  amount: amountCents,
                  currency: data.currency,
                  category: data.category,
                  date: new Date(data.date).toISOString(),
                },
              } as any);
              toast.success("Expense details saved — pending approval");
              setViewReceiptId(null);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed to save");
            }
          } : undefined}
          saving={updateReceipt.isPending}
        />
      )}
    </AppLayout>
  );
}
