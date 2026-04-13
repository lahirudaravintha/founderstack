import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

type MeResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string | null;
  role: string;
  company: {
    id: string;
    name: string;
    industry: string | null;
    currency: string;
  } | null;
};

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<MeResponse>("/api/me"),
    staleTime: 60_000,
  });
}

export function useInvalidateMe() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["me"] });
}
