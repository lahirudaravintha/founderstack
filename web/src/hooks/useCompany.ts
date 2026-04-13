import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

type Company = {
  id: string;
  name: string;
  industry?: string;
  foundedDate?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
};

type CreateCompanyInput = {
  name: string;
  industry?: string;
  foundedDate?: string;
  currency?: string;
};

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCompanyInput) =>
      api.post<Company>("/api/companies", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capital"] });
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}
