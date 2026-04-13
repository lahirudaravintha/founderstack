import { z } from "zod";

export const CreateExpenseInput = z.object({
  description: z.string().min(1).max(500),
  amount: z.number().int().positive(),
  currency: z.string().length(3).default("USD"),
  category: z.string().min(1),
  date: z.string().datetime(),
  notes: z.string().max(2000).optional(),
});

export const UpdateExpenseInput = z.object({
  description: z.string().min(1).max(500).optional(),
  amount: z.number().int().positive().optional(),
  currency: z.string().length(3).optional(),
  category: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  status: z.enum(["pending", "approved", "rejected", "reimbursed"]).optional(),
  reimbursementFile: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateExpenseInput = z.infer<typeof CreateExpenseInput>;
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseInput>;
