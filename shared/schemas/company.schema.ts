import { z } from "zod";

export const CreateCompanyInput = z.object({
  name: z.string().min(1).max(200),
  industry: z.string().max(100).optional(),
  foundedDate: z.string().datetime().optional(),
  currency: z.string().length(3).default("USD"),
});

export const CompanyOutput = CreateCompanyInput.extend({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateCompanyInput = z.infer<typeof CreateCompanyInput>;
export type CompanyOutput = z.infer<typeof CompanyOutput>;
