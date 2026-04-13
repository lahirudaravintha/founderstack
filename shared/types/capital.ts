export type ContributionCategory =
  | "cash"
  | "equipment"
  | "services"
  | "intellectual_property"
  | "real_estate"
  | "other";

export type CapitalContribution = {
  id: string;
  companyId: string;
  contributorId: string;
  amount: number; // In cents
  currency: string;
  description: string;
  category: ContributionCategory;
  date: Date;
  receiptId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};
