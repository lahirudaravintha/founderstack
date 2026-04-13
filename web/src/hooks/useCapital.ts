import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

type CapitalContribution = {
  id: string;
  companyId: string;
  contributorId: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
  receiptId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  contributor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

type CreateContributionInput = {
  amount: number;
  currency?: string;
  description: string;
  category: string;
  date: string;
  notes?: string;
  contributorId?: string;
};

export function useCapitalContributions() {
  return useQuery({
    queryKey: ["capital"],
    queryFn: () => api.get<CapitalContribution[]>("/api/capital"),
  });
}

export function useCapitalContribution(id: string) {
  return useQuery({
    queryKey: ["capital", id],
    queryFn: () => api.get<CapitalContribution>(`/api/capital/${id}`),
    enabled: !!id,
  });
}

export function useCreateContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateContributionInput) =>
      api.post<CapitalContribution>("/api/capital", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capital"] });
    },
  });
}

export function useUpdateContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: CreateContributionInput & { id: string }) =>
      api.put<CapitalContribution>(`/api/capital/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capital"] });
    },
  });
}

export function useDeleteContribution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/capital/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capital"] });
    },
  });
}
