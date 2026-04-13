# FounderStack — Lovable Prompts

> Copy and paste these prompts into Lovable one at a time to build each screen.
> Start with Prompt 1 and work your way down — each builds on the previous.

---

## Prompt 1: Project Setup & Global Layout

```
Create a SaaS app called FounderStack for startup founders to track capital contributions to their business.

Design style: Clean and minimal like Notion or Linear. Use Inter font, lots of white space, indigo (#4F46E5) as the primary color.

Start with the global layout:
- A left sidebar (240px) with the FounderStack logo at top, navigation links (Dashboard, Capital, Expenses with a "Coming soon" badge, Equity with a "Coming soon" badge, Tasks with a "Coming soon" badge, Reports with a "Coming soon" badge, a divider, Receipts, Settings), and the company name at the bottom
- A main content area with a top bar showing the page title on the left and a user avatar dropdown on the right
- The sidebar should collapse to a hamburger menu on mobile
- Use shadcn/ui components and Tailwind CSS
```

---

## Prompt 2: Dashboard

```
Build the Dashboard page (home screen) with:

1. Three summary cards at the top in a row:
   - "Total Capital" showing $125,000 in large bold text
   - "This Month" showing $15,000
   - "Contributors" showing "3 founders"
   Cards should be white with subtle border, large number, small gray label.

2. Below the cards, a line chart titled "Capital Over Time" showing cumulative capital contributions by month. Show one colored line per contributor (Lahiru, Sarah, Alex). Use recharts. Clean look, no grid clutter, tooltips on hover.

3. Below the chart, a "Recent Activity" section showing a timeline/feed:
   - "Sarah added $5,000 (Equipment) - Today"
   - "Lahiru added $10,000 (Cash) with receipt - Yesterday"
   - "Alex added $2,500 (Services) - Last week"
   Each item shows a small avatar, the action text, and a relative timestamp.

Use sample data. Everything should be responsive.
```

---

## Prompt 3: Capital Tracking Page

```
Build the Capital Tracking page with:

1. A header row with "Capital Tracking" title on the left and a indigo "+ Add Contribution" button on the right.

2. A filter bar below with dropdown filters for: Contributor (all team members), Category (Cash, Equipment, Services, IP, Real Estate, Other), and a date range picker. Plus a search icon.

3. A clean data table showing contributions with columns: Date, Contributor (with small avatar), Category (as a subtle pill/badge), Amount (right-aligned, green, monospace font), and a paperclip icon if a receipt is attached.

Sample rows:
- Apr 10 | Lahiru | Cash | $10,000 | 📎
- Apr 8 | Sarah | Equipment | $5,000
- Apr 1 | Alex | Services | $2,500
- Mar 15 | Lahiru | Cash | $50,000 | 📎

4. A total row at the bottom showing $67,500

Table rows should have a subtle hover effect. Make it responsive — on mobile the table becomes a card list.
```

---

## Prompt 4: Add Contribution Modal

```
Create a modal that opens when clicking "+ Add Contribution" on the Capital page.

The modal should be centered, max 520px wide, with a dark overlay behind it.

Form fields (top to bottom):
1. "Contributor" — dropdown to select a team member
2. "Amount" — number input with a $ prefix and a currency dropdown (USD, EUR, GBP) on the right
3. "Category" — pill-style toggle buttons (not a dropdown): Cash, Equipment, Services, IP, Real Estate, Other. Only one can be selected.
4. "Date" — date picker, default to today
5. "Description" — text input, required
6. "Receipt" — a dashed-border upload zone with "Drag & drop or click to upload receipt" text and a paperclip icon. Show supported formats (JPG, PNG, HEIC, PDF) and max size (10MB).
7. "Notes" — optional textarea

Bottom of modal: Cancel (ghost button) and Save Contribution (indigo button, disabled until required fields are filled).

When a receipt image is dropped/selected, show a small thumbnail preview with a remove button. Also show a subtle animated "Scanning receipt..." indicator to simulate OCR processing.
```

---

## Prompt 5: Receipt Upload Page

```
Build a Receipts page with:

1. Header with "Receipts" title and an "Upload Receipt" button.

2. When the upload button is clicked, show a large drag-and-drop zone: dashed border, centered icon, "Drag and drop receipt images here or click to browse", with "Supports: JPG, PNG, HEIC, PDF · Max: 10MB" in small gray text below.

3. Below the upload area, a "Recent Receipts" list showing receipt cards with:
   - A small thumbnail of the receipt image on the left
   - Vendor name, amount, and date in the middle
   - A status badge on the right: green "Confirmed" or amber "Needs Review"

Sample data:
   - Staples - $125.99 - Apr 10 - ✅ Confirmed
   - Amazon - $89.00 - Apr 8 - ✅ Confirmed
   - Unknown vendor - $?.?? - Apr 5 - ⚠️ Needs Review
   - Uber - $24.50 - Apr 1 - ✅ Confirmed

Clicking "Needs Review" items should open the Add Contribution modal with fields pre-filled and a yellow warning banner: "We couldn't read this receipt clearly. Please verify the details."
```

---

## Prompt 6: Team Settings Page

```
Build a Settings page with tabs: Company, Team, Billing, Integrations.

On the Team tab, show:

1. A "+ Invite" button in the top right

2. A list of team members, each showing:
   - Avatar and full name (with "you" badge for the current user)
   - Email address
   - Role badge (Owner in indigo, Admin in blue, Member in gray, Viewer in light gray)
   - "Modules: All" or a list of specific modules they can access
   - Edit and Remove buttons (not shown for the Owner)

3. A section for pending invitations showing email, role, and "Resend" / "Revoke" buttons

The "+ Invite" modal should have:
- Email input
- Role selector (pill toggles: Admin, Member, Viewer)
- Module access checkboxes (Capital Tracking, Expense Tracking, Equity, Tasks) — only shown when Member or Viewer is selected since Admin gets all modules
- Cancel and "Send Invite" buttons
```

---

## Prompt 7: Mobile Layout

```
Create a mobile-responsive version of the app with:

1. No sidebar — instead use a bottom tab bar with 4 tabs:
   - Home (house icon) — Dashboard
   - Capital (chart icon) — Contribution list
   - Capture (camera icon, slightly larger/prominent) — Receipt camera
   - Settings (gear icon)

2. The Capital page on mobile should show contributions as cards (not a table), each card showing the contributor name, amount, category badge, and date.

3. The Capture tab should show a camera viewfinder mockup with:
   - A subtle guide frame in the center for positioning the receipt
   - A large circular capture button at the bottom
   - A small gallery button in the bottom left

4. After "capturing", show a preview screen with the photo and two buttons: "Retake" and "Use Photo"

5. After "Use Photo", show a scanning state with a pulsing animation and "Scanning receipt... Extracting details"

6. Then show a review form pre-filled with extracted data (vendor, date, amount, category) with "Save as Contribution" and "Save as Expense" buttons at the bottom.

Make sure all transitions feel smooth. The bottom tab bar should be fixed/sticky.
```

---

## Tips for Using These in Lovable

1. **Start with Prompt 1** — it sets up the project structure everything else builds on
2. **One prompt at a time** — let Lovable finish each before moving to the next
3. **Iterate** — after each prompt, review and ask Lovable to adjust (e.g., "make the sidebar darker", "add more spacing between the cards")
4. **Export when done** — Lovable generates real React/Tailwind code that can be adapted for the final build
5. **Share the exports** — when you're happy with the designs, you can bring them into Claude Code and say "use these components as the starting point"
