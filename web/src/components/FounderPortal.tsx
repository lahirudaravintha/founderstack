import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  contributionCategories,
  formatCurrency,
  type ContributionCategory,
} from "@/lib/mock-data";
import { useCapitalContributions, useCreateContribution } from "@/hooks/useCapital";
import { useReceipts, useCreateReceipt } from "@/hooks/useReceipts";
import { Upload, Plus, DollarSign, FileText, Camera, X, SwitchCamera, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ReceiptViewer } from "@/components/ReceiptViewer";
import { CapitalDetailViewer } from "@/components/CapitalDetailViewer";
import { toast } from "sonner";
import { useMe } from "@/hooks/useMe";
import { CurrencySelect } from "@/components/CurrencySelect";
import { useUpdateReceipt } from "@/hooks/useReceipts";

function CameraCapture({ open, onClose, onCapture }: { open: boolean; onClose: () => void; onCapture: (file: File) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState(false);

  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraError(false);
    } catch {
      setCameraError(true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  // Start/stop camera when dialog opens/closes
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopCamera();
      onClose();
    }
  }, [facingMode, startCamera, stopCamera, onClose]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: 'image/jpeg' });
        stopCamera();
        onCapture(file);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleFlip = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      stopCamera();
      onCapture(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-none">
        <div className="relative w-full aspect-[3/4] bg-black flex items-center justify-center">
          {cameraError ? (
            <div className="text-center p-6">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-white/70 mb-4">Camera not available. Upload an image instead.</p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="border-white/20 text-white hover:bg-white/10">
                <ImageIcon className="w-4 h-4 mr-2" /> Choose Image
              </Button>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          )}

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
            <button onClick={() => handleOpenChange(false)} className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
            {!cameraError && (
              <button onClick={handleFlip} className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center">
                <SwitchCamera className="w-5 h-5 text-white" />
              </button>
            )}
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-6 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <button onClick={() => fileInputRef.current?.click()} className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </button>
            {!cameraError && (
              <button onClick={handleCapture} className="w-16 h-16 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 transition-colors" />
            )}
            <div className="w-11 h-11" /> {/* spacer */}
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
      </DialogContent>
    </Dialog>
  );
}

export function FounderPortal() {
  const [viewReceiptId, setViewReceiptId] = useState<string | null>(null);
  const [viewContributionId, setViewContributionId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [category, setCategory] = useState<ContributionCategory>("Cash");
  const { data: me } = useMe();
  const baseCurrency = me?.company?.currency || "USD";
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(baseCurrency);
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");

  // Sync currency default when company data loads
  const [currencyInitialized, setCurrencyInitialized] = useState(false);
  if (me?.company?.currency && !currencyInitialized) {
    setCurrency(me.company.currency);
    setCurrencyInitialized(true);
  }

  const { data: contributions = [] } = useCapitalContributions();
  const { data: receipts = [] } = useReceipts();
  const createContribution = useCreateContribution();
  const createReceipt = useCreateReceipt();
  const updateReceipt = useUpdateReceipt();
  const viewingReceipt = receipts.find((r) => r.id === viewReceiptId);
  const myContributions = contributions;
  const myTotal = myContributions.reduce((s, c) => s + c.amount, 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const uploadFile = async (file: File) => {
    // 25MB limit
    if (file.size > 25 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 25MB.");
      return;
    }
    const toastId = toast.loading("Uploading receipt...");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await createReceipt.mutateAsync({
          imageUrl: reader.result as string,
        });
        toast.success("Receipt uploaded! Analyzing in background...", { id: toastId });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed", { id: toastId });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReceiptCapture = (file: File) => {
    setFileName(file.name);
    setShowCamera(false);
    uploadFile(file);
  };

  const handleQuickUpload = () => {
    // Open file picker for quick receipt upload
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) uploadFile(file);
    };
    input.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) {
      toast.error("Please fill in amount and description");
      return;
    }
    try {
      await createContribution.mutateAsync({
        amount: Math.round(parseFloat(amount) * 100),
        currency,
        description,
        category: category.toLowerCase().replace(/ /g, "_"),
        date: new Date().toISOString(),
      });
      toast.success("Contribution added!");
      setShowForm(false);
      setAmount("");
      setDescription("");
      setFileName("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add contribution");
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">My Total Contributions</p>
            </div>
            <p className="text-3xl font-bold font-mono">{formatCurrency(myTotal / 100)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent-foreground" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Contributions Made</p>
            </div>
            <p className="text-3xl font-bold">{myContributions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Contribution + Quick Receipt side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed border-primary/30 text-primary font-medium hover:bg-primary/5 transition-colors"
          >
            <Plus className="w-8 h-8" />
            <span className="text-sm">Add Contribution</span>
          </button>
        ) : (
          <Card className="sm:col-span-2">
            <CardContent className="p-6">
              <h3 className="text-base font-semibold mb-4">New Contribution</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {contributionCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          category === cat
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Amount</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-foreground font-mono text-lg placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <CurrencySelect value={currency} onValueChange={setCurrency} className="w-28" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What is this contribution for?"
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Receipt (optional)</label>
                  <label className="flex items-center justify-center gap-3 py-6 rounded-xl border-2 border-dashed border-border hover:border-primary/40 cursor-pointer transition-colors bg-muted/50">
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                    {fileName ? (
                      <span className="text-sm text-foreground font-medium">{fileName}</span>
                    ) : (
                      <>
                        <Camera className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Tap to upload or take a photo</span>
                      </>
                    )}
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Quick Receipt Upload — sits beside Add Contribution button */}
        {!showForm && (
          <button
            onClick={handleQuickUpload}
            className="flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/50 cursor-pointer transition-colors bg-primary/5"
          >
            <Camera className="w-8 h-8 text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Quick Receipt Upload</p>
              <p className="text-xs text-muted-foreground mt-1">Take a photo or upload</p>
            </div>
          </button>
        )}
      </div>

      {/* Camera Modal */}
      <CameraCapture open={showCamera} onClose={() => setShowCamera(false)} onCapture={handleReceiptCapture} />

      {/* Recent Receipts */}
      {receipts.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-base font-semibold mb-4">Recent Receipts</h3>
            <div className="space-y-3">
              {receipts.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors" onClick={() => setViewReceiptId(r.id)}>
                  <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {r.imageUrl?.startsWith("data:image") ? (
                      <img src={r.imageUrl} alt="Receipt" className="w-full h-full object-cover" />
                    ) : r.imageUrl?.startsWith("data:application/pdf") ? (
                      <FileText className="w-5 h-5 text-red-500" />
                    ) : (
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {r.extractedData?.vendorName || (r.status === "failed" ? "Recognition failed" : "Processing...")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.extractedData?.totalAmount
                        ? formatCurrency(r.extractedData.totalAmount / 100)
                        : (r.status === "failed" ? "Tap to enter details" : "Analyzing...")}{" "}
                      · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {/* Show expense status if linked, otherwise show receipt OCR status */}
                    {r.expense?.status === "approved" ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-600 font-medium">Approved</span>
                    ) : r.expense?.status === "rejected" ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-red-500/10 text-red-600 font-medium">Rejected</span>
                    ) : r.expense?.status === "reimbursed" ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-600 font-medium">Reimbursed</span>
                    ) : r.expense?.status === "pending" ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 font-medium">Pending Approval</span>
                    ) : r.status === "processing" ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 font-medium">Processing</span>
                    ) : r.status === "failed" ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-red-500/10 text-red-600 font-medium">Failed</span>
                    ) : (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 font-medium">Review</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* My Contributions History */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold mb-4">My Contributions</h3>
          <div className="space-y-3">
            {myContributions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No contributions yet</p>
            ) : myContributions.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors" onClick={() => setViewContributionId(c.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{c.description}</p>
                    <p className="text-xs text-muted-foreground capitalize">{c.category.replace(/_/g, ' ')} · {new Date(c.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold font-mono">{formatCurrency(c.amount / 100)}</p>
                  {c.receiptId && (
                    <span className="text-[10px] text-primary font-medium">📎 Receipt</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contribution Detail Viewer */}
      {viewContributionId && (() => {
        const c = myContributions.find((x) => x.id === viewContributionId);
        return c ? (
          <CapitalDetailViewer
            contribution={c}
            onClose={() => setViewContributionId(null)}
          />
        ) : null;
      })()}

      {/* Receipt Viewer */}
      {viewingReceipt && (
        <ReceiptViewer
          receipt={viewingReceipt}
          onClose={() => setViewReceiptId(null)}
          onSaveAsContribution={async (data) => {
            if (!data.vendor || !data.amount) {
              toast.error("Please fill in vendor and amount");
              return;
            }
            try {
              await createContribution.mutateAsync({
                amount: Math.round(parseFloat(data.amount) * 100),
                currency: data.currency,
                description: data.vendor,
                category: data.category.toLowerCase().replace(/ /g, "_") || "other",
                date: new Date(data.date).toISOString(),
              });
              await updateReceipt.mutateAsync({
                id: viewingReceipt.id,
                status: "confirmed",
                extractedData: {
                  vendorName: data.vendor,
                  totalAmount: Math.round(parseFloat(data.amount) * 100),
                  currency: data.currency,
                  date: data.date,
                  category: data.category,
                },
              });
              toast.success("Contribution created from receipt");
              setViewReceiptId(null);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed to save");
            }
          }}
          onSaveManualExpense={async (data) => {
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
          }}
          saving={createContribution.isPending || updateReceipt.isPending}
        />
      )}
    </div>
  );
}
