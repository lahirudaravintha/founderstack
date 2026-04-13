import type { Role } from "./user";

export type InvitationStatus = "pending" | "accepted" | "expired";

export type Invitation = {
  id: string;
  companyId: string;
  invitedByUserId: string;
  email: string;
  role: Role;
  status: InvitationStatus;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
