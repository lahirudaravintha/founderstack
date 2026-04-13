# FounderStack — Web App (Frontend)

## Overview

The web frontend is built with **Next.js 14+ App Router** using **TypeScript** and **Tailwind CSS**. It uses **Clerk** for authentication UI (sign-up, login, user management) and communicates with the API routes in `api/`.

## Folder Structure

```
web/
├── CLAUDE.md                    ← You are here
├── app/
│   ├── layout.tsx               ← Root layout (Clerk provider, sidebar, theme)
│   ├── page.tsx                 ← Landing/marketing page
│   ├── (auth)/
│   │   ├── sign-in/             ← Clerk sign-in page
│   │   └── sign-up/             ← Clerk sign-up page
│   ├── (dashboard)/
│   │   ├── layout.tsx           ← Dashboard layout (sidebar, header)
│   │   ├── page.tsx             ← Dashboard home / overview
│   │   ├── capital/             ← Capital Tracking module pages
│   │   ├── expenses/            ← Expense Tracking module pages (future)
│   │   ├── equity/              ← Equity module pages (future)
│   │   ├── tasks/               ← Task Management module pages (future)
│   │   ├── reports/             ← Financial Reports module pages (future)
│   │   ├── settings/            ← Company settings, user management
│   │   └── receipts/            ← Receipt upload and review
│   └── (marketing)/             ← Public pages (pricing, features, etc.)
├── components/
│   ├── ui/                      ← Reusable UI components (buttons, inputs, modals)
│   ├── layout/                  ← Sidebar, Header, Navigation
│   ├── capital/                 ← Capital module specific components
│   ├── receipts/                ← Receipt upload, preview, OCR review
│   └── shared/                  ← Components used across modules
├── hooks/                       ← Custom React hooks
├── lib/                         ← Utility functions, API client
└── styles/                      ← Global styles, Tailwind config
```

## Component Conventions

### File naming
- Components: `PascalCase.tsx` (e.g., `ContributionCard.tsx`)
- Hooks: `camelCase.ts` starting with `use` (e.g., `useContributions.ts`)
- Utilities: `camelCase.ts` (e.g., `formatCurrency.ts`)

### Component structure
Every component should follow this order:

```typescript
// 1. Imports
import { useState } from "react";
import type { CapitalContribution } from "@shared/types";

// 2. TypeScript type for props
type ContributionCardProps = {
  contribution: CapitalContribution;
  onEdit?: (id: string) => void;
};

// 3. Component
export function ContributionCard({ contribution, onEdit }: ContributionCardProps) {
  // hooks first
  const [isExpanded, setIsExpanded] = useState(false);

  // handlers next
  const handleEdit = () => onEdit?.(contribution.id);

  // render last
  return (
    <div className="rounded-lg border p-4">
      {/* ... */}
    </div>
  );
}
```

### Rules
- Use **named exports**, not default exports (except for page.tsx files which Next.js requires as default)
- All props must have TypeScript types — no `any`
- Use Tailwind classes for styling — no CSS modules or styled-components
- Keep components small — if it's over 150 lines, break it up

## Permission-Gated UI

Every piece of UI that depends on a user's role or module access must be wrapped:

```typescript
import { usePermission } from "@/hooks/usePermission";

export function CapitalPage() {
  const { hasAccess, role } = usePermission("capital");

  // Don't render if user doesn't have access
  if (!hasAccess) return <AccessDenied module="Capital Tracking" />;

  // Show edit controls only for Members and above
  const canEdit = role === "owner" || role === "admin" || role === "member";

  return (
    <div>
      <ContributionList />
      {canEdit && <AddContributionButton />}
    </div>
  );
}
```

**Never hide navigation items without also blocking the API.** The API checks permissions independently — the UI just provides a good user experience.

## Receipt Upload (Web)

The web app supports drag-and-drop and file picker upload:

```
User drops/selects image
  → Show preview thumbnail
  → Upload to S3 via presigned URL
  → Call /api/receipts/process
  → Show extracted data in a review form
  → User confirms or edits
  → Create transaction
```

Accepted file types: `.jpg`, `.jpeg`, `.png`, `.heic`, `.pdf`
Max file size: 10MB

## Data Fetching

- Use **SWR** or **React Query (TanStack Query)** for data fetching — not raw `fetch` in useEffect
- All API calls go through the client in `lib/api-client.ts`
- Show loading skeletons while data loads — never show a blank screen
- Show error states with retry buttons — never show a white page on error

```typescript
// CORRECT — using SWR
const { data, error, isLoading } = useSWR("/api/capital", fetcher);

// WRONG — raw fetch in useEffect
useEffect(() => {
  fetch("/api/capital").then(/* ... */);
}, []);
```

## Styling

- **Tailwind CSS** for all styling
- Use the **shadcn/ui** component library for consistent, accessible UI components
- Dark mode support from day one — use Tailwind's `dark:` prefix
- Responsive design required — every page must work on mobile browsers too
- Color palette defined in `tailwind.config.ts` — use semantic color names like `primary`, `destructive`, `muted`

## Forms

- Use **React Hook Form** with **Zod** validation
- Import Zod schemas from `@shared/schemas` — same schemas the API uses
- Show inline validation errors, not alerts
- Disable submit buttons while submitting
- Show success/error toasts after submission
