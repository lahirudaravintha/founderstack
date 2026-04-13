# FounderStack

## What This Is

FounderStack is a SaaS application for startup founders to manage their company's finances, equity, and operations from day one. Founders sign up, invite co-founders and employees, and everyone gets role-based access to different modules.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Web app** | Next.js 14+ (React, TypeScript) | Full-stack framework — handles both the website UI and the API in one project |
| **Mobile app** | React Native (Expo) | One codebase produces both an iOS app and an Android app |
| **Database** | PostgreSQL | Reliable, handles financial data well, great JSON support for receipts |
| **ORM** | Prisma | Type-safe database queries, easy migrations, works great with TypeScript |
| **Auth** | Clerk | Handles sign-up, login, invitations, and roles out of the box |
| **File storage** | AWS S3 (or Cloudflare R2) | Stores uploaded receipt images — never store images in the database |
| **OCR / Receipt scanning** | Claude Vision API | Extracts transaction data from receipt photos using AI |
| **Payments** | Stripe | For any future subscription billing of FounderStack itself |

## Project Structure

```
founderstack/
├── CLAUDE.md              ← You are here. Top-level project context.
├── api/                   ← Backend API (Next.js API routes)
│   ├── CLAUDE.md          ← Backend conventions
│   └── ...
├── web/                   ← Web frontend (Next.js pages + components)
│   ├── CLAUDE.md          ← Frontend conventions
│   └── ...
├── mobile/                ← React Native app (Expo)
│   ├── CLAUDE.md          ← Mobile conventions
│   └── ...
├── shared/                ← Shared types, constants, and validation schemas
│   ├── CLAUDE.md          ← Data model and contracts
│   └── ...
├── prisma/                ← Database schema and migrations
│   └── schema.prisma
├── .claude/
│   └── skills/            ← Repeatable workflow recipes for Claude Code
└── .env.example           ← Template for environment variables (never commit .env)
```

## Core Data Model (Summary)

These are the key entities. Full details are in `shared/CLAUDE.md`.

- **Company** — the startup being managed
- **User** — a person with an account (founder, co-founder, employee)
- **Role** — what a user can do (Owner, Admin, Member, Viewer)
- **CapitalContribution** — money a founder put into the business
- **Transaction** — any financial event (contribution, expense, revenue)
- **Receipt** — an uploaded image linked to a transaction
- **Module** — a feature area (Capital Tracking, Expenses, Equity, Tasks, Reports)

## Permissions Model

Every user belongs to a Company and has a Role. Permissions are checked **on every API route** and **in every UI component that shows/hides features**.

| Role | What they can do |
|------|-----------------|
| **Owner** | Everything. Can delete the company. Only one per company. |
| **Admin** | Manage users, manage all modules, cannot delete company |
| **Member** | View and edit modules they have access to, upload receipts |
| **Viewer** | Read-only access to modules they have access to |

Module access is granted per-user. A Member might have access to Capital Tracking but not Equity.

## Key Rules for Claude Code

1. **TypeScript everywhere** — all code must be TypeScript, no plain JavaScript
2. **Never store secrets in code** — use environment variables via `.env`
3. **Never store images in the database** — upload to S3, store only the URL
4. **Always check permissions** — every API route must verify the user's role and module access before doing anything
5. **Validate all input** — use Zod schemas (defined in `shared/`) for every API request
6. **Mobile and web share types** — import from `shared/` so they never go out of sync
7. **Write tests** — every API route needs at least one happy-path and one error test
8. **Prisma migrations** — never edit the database by hand; always use `prisma migrate`
9. **Receipts flow** — Upload image → Store in S3 → Send to Claude Vision API → Extract data → Create Transaction → Link Receipt to Transaction
10. **Keep modules independent** — each module should work on its own; don't create hard dependencies between modules

## Future Modules (Planned)

These are coming after Capital Tracking is built:

- **Expense Tracking** — ongoing business expenses with categorization
- **Equity & Ownership** — track who owns what percentage, vesting schedules
- **Task Management** — assign and track work between co-founders
- **Revenue Tracking** — record and categorize income
- **Financial Reports** — dashboards, P&L, burn rate, runway calculations
- **Integrations** — Jira, CRMs (HubSpot, Salesforce), Stripe, bank feeds

## How to Run Locally

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Then fill in your actual values in .env

# Set up the database
npx prisma migrate dev

# Run the web app (includes API)
npm run dev

# Run the mobile app (in a separate terminal)
cd mobile && npx expo start
```

## How to Run Tests

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode during development
```
