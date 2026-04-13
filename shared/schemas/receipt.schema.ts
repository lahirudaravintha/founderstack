import { z } from "zod";

export const RequestUploadInput = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
});

export const ProcessReceiptInput = z.object({
  receiptId: z.string().uuid(),
});

export type RequestUploadInput = z.infer<typeof RequestUploadInput>;
export type ProcessReceiptInput = z.infer<typeof ProcessReceiptInput>;
