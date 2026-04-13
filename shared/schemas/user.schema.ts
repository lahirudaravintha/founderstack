import { z } from "zod";

const roles = ["owner", "admin", "member", "viewer"] as const;

export const InviteUserInput = z.object({
  email: z.string().email(),
  role: z.enum(roles).default("member"),
});

export type InviteUserInput = z.infer<typeof InviteUserInput>;
