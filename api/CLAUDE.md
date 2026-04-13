# FounderStack — API (Backend)

## Overview

The API is built using **Next.js API Routes** (located in `app/api/`). Every route is a serverless function that handles one HTTP method for one resource. The API serves both the web app and the mobile app.

## Folder Structure

```
api/
├── CLAUDE.md                  ← You are here
├── app/
│   └── api/
│       ├── auth/              ← Authentication endpoints (handled by Clerk)
│       ├── companies/         ← Company CRUD
│       ├── users/             ← User management, invitations, roles
│       ├── capital/           ← Capital contributions module
│       ├── expenses/          ← Expense tracking module (future)
│       ├── equity/            ← Equity/ownership module (future)
│       ├── tasks/             ← Task management module (future)
│       ├── receipts/          ← Receipt upload and OCR processing
│       ├── reports/           ← Financial reports module (future)
│       └── integrations/      ← Third-party integrations (future)
├── lib/
│   ├── auth.ts                ← Auth helpers (get current user, check permissions)
│   ├── db.ts                  ← Prisma client instance
│   ├── s3.ts                  ← S3 upload/download helpers
│   ├── ocr.ts                 ← Claude Vision API receipt scanning
│   ├── permissions.ts         ← Role and module access checking
│   └── errors.ts              ← Standardized error responses
└── middleware.ts              ← Global middleware (auth, rate limiting)
```

## API Route Conventions

### Every route MUST follow this pattern:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { requireModuleAccess } from "@/lib/permissions";
import { SomeInputSchema } from "@shared/schemas";

export async function POST(request: NextRequest) {
  // 1. Authenticate — who is this user?
  const user = await requireAuth(request);

  // 2. Authorize — can they do this?
  await requireModuleAccess(user, "capital", "write");

  // 3. Validate input — is the data correct?
  const body = await request.json();
  const data = SomeInputSchema.parse(body);

  // 4. Do the work — business logic here
  const result = await prisma.capitalContribution.create({ data });

  // 5. Return response — always use NextResponse.json()
  return NextResponse.json(result, { status: 201 });
}
```

### The order matters. Never skip a step:
1. **Authenticate** first (who is the user?)
2. **Authorize** second (are they allowed?)
3. **Validate** third (is the input correct?)
4. **Execute** fourth (do the work)
5. **Respond** last (return the result)

## Error Handling

All errors must use the standardized error format:

```typescript
// Consistent error response shape
{
  "error": {
    "code": "UNAUTHORIZED",        // Machine-readable code
    "message": "You do not have access to this module",  // Human-readable
    "status": 403
  }
}
```

Standard error codes:
- `UNAUTHORIZED` (401) — not logged in
- `FORBIDDEN` (403) — logged in but not allowed
- `NOT_FOUND` (404) — resource doesn't exist
- `VALIDATION_ERROR` (422) — bad input data
- `INTERNAL_ERROR` (500) — something broke

Never expose stack traces or internal details in error responses.

## Database Access

- Always use the shared Prisma client from `lib/db.ts`
- Never write raw SQL unless Prisma genuinely can't handle the query
- Use Prisma transactions for operations that update multiple tables
- Always filter by `companyId` — users must never see another company's data

```typescript
// CORRECT — always scope to the user's company
const contributions = await prisma.capitalContribution.findMany({
  where: { companyId: user.companyId },
});

// WRONG — never fetch without company scope
const contributions = await prisma.capitalContribution.findMany();
```

## Receipt Processing Flow

This is the most complex flow in the app:

1. **Client uploads image** → `POST /api/receipts/upload`
   - API generates a presigned S3 URL
   - Client uploads the image directly to S3 (not through the API)
   - Client sends the S3 key back to the API

2. **API processes the receipt** → `POST /api/receipts/process`
   - Fetch the image from S3
   - Send to Claude Vision API with a structured prompt
   - Extract: vendor name, date, amount, currency, category, line items
   - Return extracted data for user to review

3. **User confirms and creates transaction** → `POST /api/capital` or `POST /api/expenses`
   - User reviews the extracted data, makes corrections
   - Transaction is created with the receipt linked

## Rate Limiting

- Receipt uploads: 20 per hour per user
- API calls: 100 per minute per user
- Use `middleware.ts` for global rate limiting

## Environment Variables (API needs these)

```
DATABASE_URL=              # PostgreSQL connection string
CLERK_SECRET_KEY=          # Clerk authentication
AWS_S3_BUCKET=             # Receipt image storage
AWS_S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
ANTHROPIC_API_KEY=         # Claude Vision API for receipt OCR
STRIPE_SECRET_KEY=         # Stripe (future billing)
```
