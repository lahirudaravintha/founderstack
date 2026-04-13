import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

type Invitation = {
  id: string;
  companyId: string;
  invitedByUserId: string;
  email: string;
  role: string;
  status: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

type CreateInvitationInput = {
  email: string;
  role?: string;
};

export function useInvitations() {
  return useQuery({
    queryKey: ["invitations"],
    queryFn: () => api.get<Invitation[]>("/api/invitations"),
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInvitationInput) =>
      api.post<Invitation>("/api/invitations", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/invitations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
    },
  });
}
