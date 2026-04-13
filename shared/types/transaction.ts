export type TransactionType =
  | "capital_contribution"
  | "expense"
  | "revenue"
  | "reimbursement";

export type Transaction = {
  id: string;
  companyId: string;
  userId: string;
  type: TransactionType;
  amount: number; // In cents
  currency: string;
  description: string;
  category: string;
  date: Date;
  receiptId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};
