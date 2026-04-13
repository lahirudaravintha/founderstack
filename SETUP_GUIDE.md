# FounderStack — Setup Guide for Claude Code

> Follow these steps in order. Each step tells you exactly what to do and what to type.

---

## Before You Start

Make sure you have:
- [ ] Claude Code installed on your Mac
- [ ] Web app code exported from Lovable to a GitHub repo called `founderstack`
- [ ] Mobile app code downloaded from Lovable as a zip file
- [ ] A GitHub account
- [ ] Node.js installed (check by opening Terminal and typing `node --version`)

If you don't have Node.js, install it from https://nodejs.org (pick the LTS version).

---

## Step 1: Clone Your GitHub Repo

Open Terminal on your Mac and type:

```bash
cd ~/Documents
git clone https://github.com/YOUR_GITHUB_USERNAME/founderstack.git
cd founderstack
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

---

## Step 2: Reorganize the Lovable Web Code

The code Lovable exported is currently in the root of the repo. You need to move it into a `web/` folder so it matches the project structure.

Open Claude Code in the project folder:

```bash
claude
```

Then tell Claude Code:

```
The code in this repo is a web app exported from Lovable. I need you to:
1. Move all the Lovable web app code into a `web/` subfolder
2. Keep the root-level CLAUDE.md, UI_SPEC.md, LOVABLE_PROMPTS.md, and SETUP_GUIDE.md where they are
3. Keep the .claude/ folder where it is (at the root)
4. Keep the api/, mobile/, and shared/ folders where they are
5. Update any import paths in the web code if needed
```

---

## Step 3: Add the Mobile App Code

1. Unzip the Lovable mobile app download
2. Copy the unzipped folder contents into the `mobile/` folder in your project

Then tell Claude Code:

```
I've added the Lovable mobile app code to the mobile/ folder. Please:
1. Review the code and make sure it's organized correctly
2. Set it up as an Expo React Native project if it isn't already
3. Make sure the mobile/CLAUDE.md is still in place
```

---

## Step 4: Set Up the Backend

This is the big one. Tell Claude Code:

```
Set up the backend for FounderStack following the CLAUDE.md files. Start with:

1. Initialize a Next.js project in the api/ folder with TypeScript
2. Set up Prisma with PostgreSQL — create the schema based on shared/CLAUDE.md data model
3. Create the database models: Company, User, CapitalContribution, Transaction, Receipt
4. Set up Clerk authentication
5. Create a .env.example file with all needed environment variables
6. Create the core API routes for capital tracking:
   - POST /api/companies (create company)
   - GET /api/capital (list contributions)
   - POST /api/capital (add contribution)
   - GET /api/capital/[id] (get single contribution)
   - PUT /api/capital/[id] (update contribution)
   - DELETE /api/capital/[id] (delete contribution)
7. Every route must follow the auth → authorize → validate → execute → respond pattern

Don't build the receipt OCR yet — just the basic CRUD for capital tracking.
```

---

## Step 5: Set Up the Database

You'll need PostgreSQL running locally. Tell Claude Code:

```
Help me set up PostgreSQL on my Mac. I need:
1. PostgreSQL installed and running
2. A database created called "founderstack_dev"
3. The DATABASE_URL added to .env
4. Prisma migrations run to create the tables
```

---

## Step 6: Connect the Web UI to the Backend

Now wire up the Lovable UI to the real API. Tell Claude Code:

```
Connect the Lovable web UI in web/ to the real API in api/. 
1. Set up an API client in web/lib/api-client.ts
2. Replace the mock/sample data in the Dashboard page with real API calls using SWR
3. Replace the mock data in the Capital Tracking page with real API calls
4. Connect the Add Contribution modal to POST /api/capital
5. Add Clerk authentication to the web app (sign in, sign up, protected routes)
```

---

## Step 7: Set Up Receipt Scanning

Once the basics work, add receipt scanning. Tell Claude Code:

```
Set up the receipt scanning pipeline following the receipt-ocr-pipeline skill:
1. Set up AWS S3 (or Cloudflare R2) for receipt image storage
2. Create the presigned URL endpoint for uploads
3. Integrate the Claude Vision API for receipt OCR
4. Create the receipt processing endpoint
5. Connect the receipt upload UI on web to the real upload flow
6. Connect the receipt review form to create transactions from scanned data
```

---

## Step 8: Set Up the Mobile App

Tell Claude Code:

```
Set up the mobile app in mobile/ as a working Expo React Native project:
1. Initialize Expo if not already done
2. Install dependencies (expo-camera, expo-image-picker, expo-image-manipulator, expo-secure-store, @clerk/clerk-expo)
3. Set up Clerk authentication for mobile
4. Connect the API client to the same backend
5. Wire up the camera receipt capture flow to the real receipt scanning API
```

---

## Step 9: Add Team Management

Tell Claude Code:

```
Build the team management feature:
1. Create API routes for inviting users, managing roles, and setting module access
2. Connect the Settings/Team page UI to the real API
3. Implement the invite flow with Clerk
4. Make sure permissions are enforced on every API route
5. Make sure the UI hides/shows features based on the user's role
```

---

## Step 10: Test Everything

Tell Claude Code:

```
Write tests for all the API routes:
1. Happy path tests for each endpoint
2. Authentication failure tests (no token → 401)
3. Permission failure tests (wrong role → 403)
4. Validation failure tests (bad input → 422)
5. Run all tests and fix any failures
```

---

## Tips for Working with Claude Code

- **One step at a time** — don't try to do everything at once. Complete each step before moving on.
- **Test as you go** — after each step, run the app and make sure things work before continuing.
- **Be specific** — the more detail you give Claude Code, the better the result.
- **Refer to the docs** — if Claude Code seems confused, remind it: "Follow the conventions in CLAUDE.md"
- **Save your progress** — commit to GitHub after each major step:
  ```
  git add -A
  git commit -m "Describe what you just did"
  git push
  ```

---

## Environment Variables You'll Need

These are the services you'll need to sign up for (all have free tiers):

| Service | What it's for | Sign up at |
|---------|--------------|------------|
| **Clerk** | User auth (sign up, login, invites) | https://clerk.com |
| **Neon** or **Supabase** | PostgreSQL database (cloud) | https://neon.tech or https://supabase.com |
| **AWS S3** or **Cloudflare R2** | Receipt image storage | https://aws.amazon.com or https://cloudflare.com |
| **Anthropic** | Claude API for receipt OCR | https://console.anthropic.com |
| **Stripe** | Payment processing (later) | https://stripe.com |
