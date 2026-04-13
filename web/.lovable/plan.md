

# FounderLedger — Startup Capital & Expense Tracker

## Overview
A multi-platform app (web + iOS + Android via Capacitor) for startup founders to track capital contributions, manage expenses, scan receipts with AI, and handle reimbursements — all with role-based access.

---

## Authentication & Workspace Setup
- Email/password signup with Lovable Cloud auth
- On first signup, user creates a **workspace** (company)
- Workspace stores company name, currency, logo, and settings
- Invite system: Admin sends email invites; invitees join the workspace on signup

## Roles & Permissions
- **Admin** — full access to all modules, can invite/remove members, mark reimbursements
- **Founder** — can log capital contributions, upload receipts, view own dashboard
- **Employee** — can upload receipts, view own reimbursement status
- Roles stored in a dedicated `user_roles` table (not on profiles)

## Database Tables
- `workspaces` — company info, default currency
- `workspace_members` — links users to workspaces
- `user_roles` — role-based permissions (admin/founder/employee)
- `profiles` — user display name, avatar
- `capital_contributions` — type (cash, asset, sweat equity), amount, currency, date, notes, timeline
- `expenses` — amount, currency, category, date, receipt image, OCR data, reimbursement status
- `reimbursements` — links to expenses, bank slip upload, confirmation by both parties
- `invitations` — pending invites with email, role, status

## Pages & Views

### Admin View
1. **Dashboard** — summary cards: total capital raised, total expenses, pending reimbursements, contribution breakdown by founder, charts over time
2. **Expenses** — table of all expenses across members, filter by person/date/status; ability to upload bank slip and mark as reimbursed
3. **Capital Tracker** — timeline view of all capital contributions by founder, filterable by type (cash/asset/sweat equity)
4. **Team Management** — invite founders/employees via email, assign roles, manage members
5. **Settings** — company name, logo, default currency, workspace preferences

### Founder/Employee View
1. **My Dashboard** — personal summary: total invested, total expenses, pending reimbursements, contribution timeline
2. **Upload Receipt** — camera capture (native via Capacitor) or file upload; AI-powered OCR extracts vendor, amount, date, category; user confirms/edits before saving
3. **My Expenses** — list of submitted expenses with reimbursement status; ability to confirm receipt of reimbursement
4. **My Contributions** — timeline of capital contributions (founders only)

## Receipt Scanning (AI OCR)
- Edge function using Lovable AI (Gemini vision model) to extract structured data from receipt photos
- Extracts: vendor name, total amount, currency, date, line items, category
- User reviews and confirms extracted data before it becomes a transaction
- Receipt image stored in Supabase Storage bucket

## Multi-Currency Support
- Each workspace has a default currency
- Contributions and expenses can be logged in any currency
- Display amounts in original currency with optional conversion

## Mobile (Capacitor)
- Native iOS and Android apps via Capacitor
- Camera access for receipt photo capture
- Same codebase as web, compiled to native

## Key UX Details
- Clean, professional UI with shadcn/ui components
- Responsive design for both web and mobile
- Toast notifications for actions (invite sent, receipt scanned, reimbursement confirmed)
- Empty states with clear CTAs for new workspaces

