import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

type Expense = {
  id: string;
  companyId: string;
  userId: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  status: "pending" | "approved" | "rejected" | "reimbursed";
  receiptId: string | null;
  reimbursementFile: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  receipt?: {
    id: string;
    imageUrl: string;
    status: string;
    extractedData: Record<string, unknown> | null;
  } | null;
};

type CreateExpenseInput = {
  description: string;
  amount: number;
  currency?: string;
  category: string;
  date: string;
  notes?: string;
};

type UpdateExpenseInput = {
  id: string;
  description?: string;
  amount?: number;
  currency?: string;
  category?: string;
  date?: string;
  status?: "pending" | "approved" | "rejected" | "reimbursed";
  reimbursementFile?: string;
  notes?: string;
};

export function useExpenses() {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: () => api.get<Expense[]>("/api/expenses"),
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseInput) =>
      api.post<Expense>("/api/expenses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateExpenseInput) =>
      api.put<Expense>(`/api/expenses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
}
