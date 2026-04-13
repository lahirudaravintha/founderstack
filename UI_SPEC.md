# FounderStack — UI Specification

> Use this document as a prompt/reference when building screens in Lovable.
> Design direction: **Clean and minimal** — think Notion meets Linear. White space, clear hierarchy, no clutter.

---

## Design Tokens

### Colors
- **Primary**: Indigo (#4F46E5) — buttons, active states, links
- **Primary hover**: Darker indigo (#4338CA)
- **Success**: Emerald (#10B981) — positive amounts, confirmations
- **Warning**: Amber (#F59E0B) — low-confidence OCR, pending states
- **Destructive**: Red (#EF4444) — delete actions, errors
- **Background**: White (#FFFFFF)
- **Surface**: Light gray (#F9FAFB) — card backgrounds, sidebar
- **Border**: Gray (#E5E7EB)
- **Text primary**: Near-black (#111827)
- **Text secondary**: Gray (#6B7280)
- **Text muted**: Light gray (#9CA3AF)

### Typography
- **Font**: Inter (or system font stack)
- **Headings**: Semibold, sizes 24/20/16px
- **Body**: Regular, 14px
- **Small/labels**: Medium, 12px
- **Monospace** (for amounts): JetBrains Mono or SF Mono

### Spacing & Layout
- **Border radius**: 8px for cards, 6px for buttons/inputs
- **Sidebar width**: 240px
- **Max content width**: 1200px, centered
- **Card padding**: 24px
- **Grid gap**: 16px

---

## Global Layout

```
┌──────────────────────────────────────────────────┐
│  Sidebar (240px)  │  Main Content Area           │
│                   │                               │
│  [Logo]           │  ┌─ Top Bar ──────────────┐  │
│                   │  │ Page Title    [User ▾]  │  │
│  Navigation:      │  └────────────────────────┘  │
│  • Dashboard      │                               │
│  • Capital        │  ┌─ Page Content ──────────┐ │
│  • Expenses ◌     │  │                          │ │
│  • Equity ◌       │  │                          │ │
│  • Tasks ◌        │  │                          │ │
│  • Reports ◌      │  │                          │ │
│  ─────────        │  │                          │ │
│  • Receipts       │  │                          │ │
│  • Settings       │  └──────────────────────────┘ │
│                   │                               │
│  [Company name]   │                               │
│  [Plan: Free]     │                               │
└──────────────────────────────────────────────────┘

◌ = "Coming soon" badge (grayed out, not clickable)
```

- Sidebar is always visible on desktop, collapsible on tablet/mobile
- Active nav item has an indigo background highlight
- Navigation items show icons on the left (use Lucide icons)

---

## Screen-by-Screen Specification

### 1. Sign Up / Sign In

**Route**: `/sign-up`, `/sign-in`

**Layout**: Centered card on a light gray background. No sidebar.

**Sign Up flow**:
1. Email + password (or Google/GitHub OAuth)
2. After sign-up → "Create your company" step
   - Company name (required)
   - Industry (optional dropdown)
   - Default currency (dropdown, default USD)
3. → Redirect to Dashboard

**Sign In**: Email + password, "Forgot password" link, OAuth buttons

**Design notes**:
- FounderStack logo centered above the card
- Card is max 420px wide, white, subtle shadow
- Single column form, generous spacing

---

### 2. Dashboard (Home)

**Route**: `/dashboard`

**Purpose**: At-a-glance overview of the company's financial position.

**Layout**:
```
┌─ Summary Cards (3 across) ────────────────────┐
│ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│ │Total      │ │This Month│ │ Contributors │   │
│ │Capital    │ │Added     │ │              │   │
│ │$125,000   │ │$15,000   │ │ 3 founders   │   │
│ └──────────┘ └──────────┘ └──────────────┘   │
└───────────────────────────────────────────────┘

┌─ Capital Timeline (chart) ────────────────────┐
│                                                │
│  Line chart showing cumulative capital over    │
│  time. X-axis = months, Y-axis = dollars.     │
│  One line per contributor (color-coded).       │
│                                                │
└────────────────────────────────────────────────┘

┌─ Recent Activity ─────────────────────────────┐
│  Today                                         │
│  • Sarah added $5,000 (Equipment) ............ │
│  Yesterday                                     │
│  • Lahiru added $10,000 (Cash) with receipt .. │
│  Last week                                     │
│  • Alex added $2,500 (Services) .............. │
└────────────────────────────────────────────────┘
```

**Design notes**:
- Summary cards: white bg, subtle border, large bold number, small gray label
- Chart: clean line chart, no grid clutter, tooltips on hover
- Activity feed: simple list with avatars, timestamps, amounts in green

---

### 3. Capital Tracking

**Route**: `/capital`

**Purpose**: Full list of all capital contributions with filtering and the ability to add new ones.

**Layout**:
```
┌─ Header ──────────────────────────────────────┐
│  Capital Tracking          [+ Add Contribution]│
└────────────────────────────────────────────────┘

┌─ Filters Bar ─────────────────────────────────┐
│ [Contributor ▾] [Category ▾] [Date range] [🔍]│
└────────────────────────────────────────────────┘

┌─ Contributions Table ─────────────────────────┐
│  Date     │ Contributor │ Category  │ Amount   │
│──────────────────────────────────────────────  │
│  Apr 10   │ Lahiru      │ Cash      │ $10,000  │
│  Apr 8    │ Sarah       │ Equipment │ $5,000   │
│  Apr 1    │ Alex        │ Services  │ $2,500   │
│  Mar 15   │ Lahiru      │ Cash      │ $50,000  │
│           │             │           │          │
│  ──────── │ ────────    │ ───────── │ ──────── │
│  Total                               $67,500   │
└────────────────────────────────────────────────┘
```

**Table row behavior**:
- Hover: slight gray background
- Click: opens a slide-over panel on the right showing full details + receipt image
- Receipt icon (📎) shows next to entries that have a receipt attached

**"+ Add Contribution" button** opens a modal (see below)

---

### 4. Add Contribution Modal

**Trigger**: Click "+ Add Contribution" on the Capital page

**Layout**: Centered modal, max 520px wide

```
┌─ Add Capital Contribution ──────── [✕] ──────┐
│                                                │
│  Contributor                                   │
│  [Dropdown: select team member ▾]              │
│                                                │
│  Amount                                        │
│  [$] [_______________] [USD ▾]                 │
│                                                │
│  Category                                      │
│  [Cash] [Equipment] [Services] [IP] [Other]    │
│  (pill-style toggle buttons)                   │
│                                                │
│  Date                                          │
│  [📅 April 10, 2026]                           │
│                                                │
│  Description                                   │
│  [________________________________]            │
│  [________________________________]            │
│                                                │
│  Receipt (optional)                            │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐            │
│  │   📎 Drag & drop or click     │            │
│  │      to upload receipt         │            │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘            │
│                                                │
│  Notes (optional)                              │
│  [________________________________]            │
│                                                │
│            [Cancel]  [Save Contribution]       │
└────────────────────────────────────────────────┘
```

**Behavior**:
- If a receipt is uploaded, show a thumbnail preview with a "Remove" option
- After upload, a scanning indicator appears: "Scanning receipt..."
- When OCR finishes, auto-fill the Amount, Date, and Category fields
- User can override any auto-filled values
- "Save Contribution" is indigo, disabled until required fields are filled

---

### 5. Receipt Capture (Mobile)

**Tab**: Camera icon in the bottom tab bar

**Flow**:

```
Screen 1: Camera Viewfinder
┌────────────────────────┐
│                        │
│     [Camera feed]      │
│                        │
│  ┌──────────────────┐  │
│  │ Position receipt  │  │
│  │ within the frame  │  │
│  └──────────────────┘  │
│                        │
│   [Gallery]  [📷]      │
└────────────────────────┘

Screen 2: Photo Preview
┌────────────────────────┐
│                        │
│   [Receipt photo]      │
│                        │
│ [Retake]  [Use Photo]  │
└────────────────────────┘

Screen 3: Scanning
┌────────────────────────┐
│                        │
│   [Receipt thumbnail]  │
│                        │
│   ⟳ Scanning receipt...│
│   Extracting details   │
│                        │
└────────────────────────┘

Screen 4: Review & Confirm
┌────────────────────────┐
│  Review Receipt        │
│                        │
│  [Small receipt image] │
│                        │
│  Vendor: [Staples    ] │
│  Date:   [Apr 10 2026] │
│  Amount: [$125.99    ] │
│  Category: [Equipment▾]│
│  Description:          │
│  [Office supplies    ] │
│                        │
│  ⚠️ Low confidence on  │
│     the date field     │
│                        │
│  [Save as Contribution]│
│  [Save as Expense     ]│
│  [Discard             ]│
└────────────────────────┘
```

**Design notes**:
- Camera viewfinder: full screen, dark background, subtle guide frame
- Scanning screen: clean animation (pulsing dots or a spinner), calm feel
- Review screen: pre-filled form with yellow highlight on low-confidence fields
- Two save options because the receipt could be a capital contribution or an expense

---

### 6. Receipt Upload (Web)

**Route**: `/receipts`

**Layout**:
```
┌─ Header ──────────────────────────────────────┐
│  Receipts                   [Upload Receipt]   │
└────────────────────────────────────────────────┘

┌─ Upload Area (when clicking Upload Receipt) ──┐
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐  │
│  │                                          │  │
│  │   📎 Drag and drop receipt images here   │  │
│  │      or click to browse                  │  │
│  │                                          │  │
│  │   Supports: JPG, PNG, HEIC, PDF          │  │
│  │   Max size: 10MB                         │  │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘  │
└────────────────────────────────────────────────┘

┌─ Recent Receipts ─────────────────────────────┐
│  [🖼️] Staples - $125.99 - Apr 10  ✅ Confirmed │
│  [🖼️] Amazon - $89.00 - Apr 8     ✅ Confirmed │
│  [🖼️] Unknown - ??? - ???         ⚠️ Review    │
│  [🖼️] Uber - $24.50 - Apr 1      ✅ Confirmed │
└────────────────────────────────────────────────┘
```

**Behavior**:
- Clicking a receipt with "Review" status opens the review form (same as Add Contribution modal, but pre-filled from OCR)
- Clicking a confirmed receipt opens a read-only detail view with the receipt image

---

### 7. Settings — Team Management

**Route**: `/settings/team`

**Layout**:
```
┌─ Settings Tabs ───────────────────────────────┐
│  [Company]  [Team]  [Billing]  [Integrations] │
└────────────────────────────────────────────────┘

┌─ Team Members ────────────────── [+ Invite] ──┐
│                                                │
│  👤 Lahiru (you)                               │
│     lahiru@rooster.org · Owner                 │
│     Modules: All                               │
│                                                │
│  👤 Sarah Chen                                 │
│     sarah@founderstack.co · Admin              │
│     Modules: All                               │
│     [Edit] [Remove]                            │
│                                                │
│  👤 Alex Rivera                                │
│     alex@founderstack.co · Member              │
│     Modules: Capital, Expenses                 │
│     [Edit] [Remove]                            │
│                                                │
│  📧 pending@example.com                        │
│     Invited · Member (pending)                 │
│     [Resend] [Revoke]                          │
│                                                │
└────────────────────────────────────────────────┘
```

**"+ Invite" modal**:
```
┌─ Invite Team Member ─────────── [✕] ─────────┐
│                                                │
│  Email address                                 │
│  [_______________________________]             │
│                                                │
│  Role                                          │
│  [Admin] [Member] [Viewer]                     │
│  (pill-style toggle)                           │
│                                                │
│  Module Access                                 │
│  ☑ Capital Tracking                            │
│  ☑ Expense Tracking                            │
│  ☐ Equity & Ownership                          │
│  ☐ Task Management                             │
│  (checkboxes, only shown for Member/Viewer)    │
│                                                │
│              [Cancel]  [Send Invite]           │
└────────────────────────────────────────────────┘
```

---

### 8. Contribution Detail (Slide-over Panel)

**Trigger**: Click any row in the Capital Tracking table

**Layout**: Panel slides in from the right (480px wide)

```
┌─ Contribution Detail ─────────── [✕] ────────┐
│                                                │
│  $10,000.00                                    │
│  Cash contribution                             │
│                                                │
│  ──────────────────────────────────            │
│                                                │
│  Contributor    Lahiru                         │
│  Date           April 10, 2026                 │
│  Category       Cash                           │
│  Description    Initial seed investment         │
│  Notes          Transferred from personal       │
│                 savings account                 │
│                                                │
│  ──────────────────────────────────            │
│                                                │
│  Receipt                                       │
│  ┌────────────────────┐                        │
│  │  [Receipt image    │                        │
│  │   thumbnail]       │  Click to enlarge      │
│  └────────────────────┘                        │
│                                                │
│  ──────────────────────────────────            │
│                                                │
│  Created Apr 10, 2026 at 2:15 PM              │
│                                                │
│  [Edit]                        [Delete]        │
└────────────────────────────────────────────────┘
```

---

### 9. Mobile — Bottom Tab Bar

```
┌────────────────────────────────────────┐
│  🏠        📊        📷       ⚙️       │
│  Home    Capital   Capture  Settings   │
└────────────────────────────────────────┘
```

- **Home**: Dashboard summary
- **Capital**: Contribution list (scrollable cards, not a table)
- **Capture**: Opens camera for receipt scanning
- **Settings**: Team, company settings, profile

---

## Interaction Patterns

### Loading states
- Use skeleton loaders (gray pulsing blocks) that match the shape of the content
- Never show a blank screen or a full-page spinner

### Empty states
- When a list has no items, show a friendly illustration with a clear call to action
- Example: Capital page with no contributions → "No contributions yet. Add your first one to start tracking." with a prominent button

### Toasts / notifications
- Success: green, top-right, auto-dismiss after 3 seconds
- Error: red, top-right, requires manual dismiss
- Info: indigo, top-right, auto-dismiss after 5 seconds

### Modals
- Centered, max 520px wide
- Dark overlay behind (opacity 50%)
- Close with X button, Escape key, or clicking overlay
- Form modals: Cancel and primary action buttons at the bottom right

### Mobile navigation
- Bottom tab bar (4 tabs)
- Modals slide up from bottom
- Lists use pull-to-refresh
- Swipe right to go back

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|-----------|----------|
| Desktop (1024px+) | Full sidebar + content |
| Tablet (768-1023px) | Collapsible sidebar (hamburger menu) |
| Mobile (<768px) | No sidebar, bottom navigation bar |

The web app must be fully usable on mobile browsers (some users won't install the app).
