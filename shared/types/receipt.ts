export type ReceiptStatus =
  | "uploaded"
  | "processing"
  | "reviewed"
  | "confirmed"
  | "failed";

export type LineItem = {
  description: string;
  quantity?: number;
  unitPrice?: number; // In cents
  totalPrice: number; // In cents
};

export type ExtractedReceiptData = {
  vendorName?: string;
  date?: string;
  totalAmount?: number; // In cents
  currency?: string;
  category?: string;
  lineItems?: LineItem[];
  confidence: number; // 0-1
  rawText?: string;
};

export type Receipt = {
  id: string;
  companyId: string;
  uploadedById: string;
  imageUrl: string;
  thumbnailUrl?: string;
  status: ReceiptStatus;
  extractedData?: ExtractedReceiptData;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
};
