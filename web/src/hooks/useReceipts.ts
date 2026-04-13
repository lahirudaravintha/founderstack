import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

type Receipt = {
  id: string;
  companyId: string;
  uploadedById: string;
  imageUrl: string;
  thumbnailUrl: string | null;
  status: "uploaded" | "processing" | "reviewed" | "confirmed" | "failed";
  extractedData: {
    vendorName?: string;
    date?: string;
    totalAmount?: number;
    currency?: string;
    category?: string;
    confidence?: number;
  } | null;
  transactionId: string | null;
  expense?: {
    id: string;
    status: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export function useReceipts() {
  return useQuery({
    queryKey: ["receipts"],
    queryFn: () => api.get<Receipt[]>("/api/receipts"),
  });
}

export function useCreateReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { imageUrl: string }) => {
      // Step 1: Upload receipt (fast — just saves image + creates placeholder expense)
      const receipt = await api.post<Receipt>("/api/receipts", data);

      // Step 2: Fire OCR via streaming endpoint (keeps connection alive up to 60s)
      api.streamPost(`/api/receipts/${receipt.id}/ocr`, {}).then(() => {
        queryClient.invalidateQueries({ queryKey: ["receipts"] });
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
      }).catch(() => {
        queryClient.invalidateQueries({ queryKey: ["receipts"] });
      });

      return receipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useUpdateReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; status?: string; extractedData?: Record<string, unknown>; expenseData?: Record<string, unknown> }) =>
      api.put<Receipt>(`/api/receipts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useDeleteReceipt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/receipts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
    },
  });
}
