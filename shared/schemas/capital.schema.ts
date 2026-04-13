import { z } from "zod";

const contributionCategories = [
  "cash",
  "equipment",
  "services",
  "intellectual_property",
  "real_estate",
  "other",
] as const;

export const CreateContributionInput = z.object({
  amount: z.number().int().positive(),
  currency: z.string().length(3).default("USD"),
  description: z.string().min(1).max(500),
  category: z.enum(contributionCategories),
  date: z.string().datetime(),
  notes: z.string().max(2000).optional(),
  contributorId: z.string().uuid().optional(),
});

export const UpdateContributionInput = CreateContributionInput.partial();

export const ContributionOutput = CreateContributionInput.extend({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  contributorId: z.string().uuid(),
  receiptId: z.string().uuid().optional().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateContributionInput = z.infer<typeof CreateContributionInput>;
export type UpdateContributionInput = z.infer<typeof UpdateContributionInput>;
export type ContributionOutput = z.infer<typeof ContributionOutput>;
