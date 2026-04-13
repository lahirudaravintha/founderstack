# FounderStack — Shared Types & Data Model

## Overview

This folder contains everything shared between the API, web app, and mobile app: TypeScript types, Zod validation schemas, constants, and enums. **Any time you change something here, it affects all three platforms**, so be careful and deliberate.

## Folder Structure

```
shared/
├── CLAUDE.md              ← You are here
├── types/
│   ├── index.ts           ← Re-exports everything
│   ├── user.ts            ← User, Role types
│   ├── company.ts         ← Company type
│   ├── capital.ts         ← CapitalContribution type
│   ├── transaction.ts     ← Transaction type (base for all financial events)
│   ├── receipt.ts         ← Receipt type
│   ├── expense.ts         ← Expense type (future)
│   ├── equity.ts          ← Equity/ownership types (future)
│   └── task.ts            ← Task types (future)
├── schemas/
│   ├── index.ts           ← Re-exports everything
│   ├── capital.schema.ts  ← Zod schemas for capital contribution input/output
│   ├── receipt.schema.ts  ← Zod schemas for receipt processing
│   ├── user.schema.ts     ← Zod schemas for user management
│   └── company.schema.ts  ← Zod schemas for company operations
├── constants/
│   ├── roles.ts           ← Role definitions and permission maps
│   ├── modules.ts         ← Module definitions
│   └── currencies.ts      ← Supported currencies
└── utils/
    ├── formatCurrency.ts  ← Currency formatting (used on all platforms)
    └── dateUtils.ts       ← Date formatting and comparison helpers
```

## Complete Data Model

### Company

```typescript
type Company = {
  id: string;                  // UUID
  name: string;                // "Acme Inc."
  industry?: string;           // "SaaS", "E-commerce", etc.
  foundedDate?: Date;          // When the company was started
  currency: string;            // Default currency: "USD", "EUR", etc.
  createdAt: Date;
  updatedAt: Date;
};
```

### User

```typescript
type User = {
  id: string;                  // UUID
  clerkId: string;             // Clerk's external user ID
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  companyId: string;           // Which company they belong to
  role: Role;                  // Their role in the company
  moduleAccess: ModuleAccess[];// Which modules they can use
  createdAt: Date;
  updatedAt: Date;
};

type Role = "owner" | "admin" | "member" | "viewer";

type ModuleAccess = {
  moduleId: string;            // e.g., "capital", "expenses"
  permission: "read" | "write";// Read-only or full access
};
```

### Capital Contribution

```typescript
type CapitalContribution = {
  id: string;                  // UUID
  companyId: string;
  contributorId: string;       // The user who contributed
  amount: number;              // In cents (never use decimals for money)
  currency: string;            // "USD", "EUR", etc.
  description: string;         // "Initial seed investment", "Equipment purchase"
  category: ContributionCategory;
  date: Date;                  // When the contribution was made
  receiptId?: string;          // Linked receipt, if any
  notes?: string;              // Optional additional notes
  createdAt: Date;
  updatedAt: Date;
};

type ContributionCategory =
  | "cash"                     // Direct cash investment
  | "equipment"                // Equipment purchased for the business
  | "services"                 // Professional services paid for
  | "intellectual_property"    // IP contributed (valued)
  | "real_estate"              // Office space, etc.
  | "other";
```

### Transaction (Base Type)

```typescript
// All financial events share this base shape
type Transaction = {
  id: string;                  // UUID
  companyId: string;
  userId: string;              // Who created the transaction
  type: TransactionType;
  amount: number;              // In cents — ALWAYS use cents, never decimals
  currency: string;
  description: string;
  category: string;            // Category depends on transaction type
  date: Date;
  receiptId?: string;
  metadata?: Record<string, unknown>; // Flexible extra data
  createdAt: Date;
  updatedAt: Date;
};

type TransactionType =
  | "capital_contribution"
  | "expense"                  // Future
  | "revenue"                  // Future
  | "reimbursement";           // Future
```

### Receipt

```typescript
type Receipt = {
  id: string;                  // UUID
  companyId: string;
  uploadedById: string;        // Who uploaded it
  imageUrl: string;            // S3 URL — NEVER store the image itself
  thumbnailUrl?: string;       // Smaller version for lists
  status: ReceiptStatus;
  extractedData?: ExtractedReceiptData; // Data from OCR
  transactionId?: string;      // Linked transaction after confirmation
  createdAt: Date;
  updatedAt: Date;
};

type ReceiptStatus =
  | "uploaded"                 // Image uploaded, not yet scanned
  | "processing"               // OCR in progress
  | "reviewed"                 // OCR done, waiting for user to confirm
  | "confirmed"                // User confirmed, transaction created
  | "failed";                  // OCR failed, needs manual entry

type ExtractedReceiptData = {
  vendorName?: string;
  date?: string;               // ISO date string
  totalAmount?: number;        // In cents
  currency?: string;
  category?: string;           // Best guess from OCR
  lineItems?: LineItem[];
  confidence: number;          // 0-1, how confident the OCR is
  rawText?: string;            // Full text extracted from receipt
};

type LineItem = {
  description: string;
  quantity?: number;
  unitPrice?: number;          // In cents
  totalPrice: number;          // In cents
};
```

## Critical Rules

### Money is ALWAYS in cents

```typescript
// CORRECT — store $150.00 as 15000 cents
const amount = 15000;

// WRONG — never use floating point for money
const amount = 150.00;  // This WILL cause rounding errors
```

Convert for display only:
```typescript
function formatCurrency(cents: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}
```

### IDs are always UUIDs

Generate with `crypto.randomUUID()` or let Prisma generate them.

### Dates are always ISO 8601

Store as `DateTime` in the database, transmit as ISO strings in JSON, parse with `new Date()`.

### Every schema has an Input and Output version

```typescript
// Input — what the client sends (no id, no timestamps)
const CreateContributionInput = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  description: z.string().min(1).max(500),
  category: z.enum(["cash", "equipment", "services", "intellectual_property", "real_estate", "other"]),
  date: z.string().datetime(),
  notes: z.string().max(2000).optional(),
});

// Output — what the API returns (includes id and timestamps)
const ContributionOutput = CreateContributionInput.extend({
  id: z.string().uuid(),
  companyId: z.string().uuid(),
  contributorId: z.string().uuid(),
  receiptId: z.string().uuid().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

## Prisma Schema (Database)

The Prisma schema lives in `prisma/schema.prisma` at the project root. It must mirror the types defined here exactly. When you add a new type here, also add the corresponding Prisma model and create a migration.

## Adding a New Shared Type

1. Create the TypeScript type in `shared/types/`
2. Create the Zod schemas in `shared/schemas/`
3. Export from the index files
4. Add the Prisma model in `prisma/schema.prisma`
5. Run `npx prisma migrate dev --name describe_your_change`
6. Update any API routes, web components, and mobile screens that need the new type
