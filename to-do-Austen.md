# Pull-Up Club: Lovable Rebuild — Austin's Guide

---

## Step 1: Before You Start (Read This First)

### Take Screenshots of the Current Website

Before you do anything in Lovable, go to the live Pull-Up Club website and **take a screenshot of every page**. You'll paste these into Lovable alongside each prompt — it makes the output dramatically better because Lovable can match the exact layout, spacing, and feel instead of guessing.

**Pages to screenshot:**
- Home page (full scroll — you may need multiple screenshots for the hero, how it works, perks, leaderboard preview, testimonials, and footer)
- Login page
- Sign-up page
- Subscription/pricing page
- Profile page (each of the 4 tabs: Submissions, Rankings, Settings, Subscription)
- Video submission page
- Leaderboard page (including the filter bar and badge legend)
- Admin dashboard (submissions list + stats)
- Admin payouts page
- Ethos page
- FAQ page
- Rules page

Save all screenshots in a folder on your computer so they're easy to drag into Lovable.

### Download Brand Assets from Google Drive

Before running the prompts, download these from Google Drive and have them ready to upload into Lovable:
- **PUC logo** (both dark and light versions if available)
- **Badge icons** for all 5 tiers: Recruit, Proven, Hardened, Operator, Elite
- Any hero images or background images used on the site
- Social media icons if we have custom ones

To upload into Lovable: drag and drop the image file into the chat, then tell Lovable where to use it (e.g., "Use this as the logo in the header" or "Use this as the Recruit badge icon").

### Critical Rules for Working with Lovable

**DO NOT let Lovable create new database tables.** Our Supabase database already has all the tables it needs. When Lovable suggests running SQL to create tables, **do not run it**. Instead, tell Lovable: "The table already exists in Supabase, just connect to it."

**DO NOT let Lovable create new Edge Functions.** We already have all the Edge Functions deployed in Supabase. When a prompt mentions connecting to an Edge Function, tell Lovable to call the existing one, not create a new one.

**DO NOT paste API keys or secrets in the Lovable chat.** Always use the "Add API Key" button or add them through Supabase Dashboard > Edge Functions > Manage Secrets.

**If something looks wrong after a prompt**, use Lovable's **Edit mode** to fix just that part. Don't re-run the whole prompt. You can click on any element and tell Lovable what to change.

**Make sure every page is mobile responsive.** If Lovable doesn't make it responsive automatically, add to your prompt: "Make sure this is fully responsive on mobile with proper stacking and spacing."

### Design Reference

Keep these values handy — include them whenever Lovable drifts from the look and feel:

| Token | Value |
|-------|-------|
| Accent color | `#9b9b6f` (olive/army green) |
| Font | Inter (Google Fonts) |
| Background | `#0a0a0a` (near black) |
| Card style | Dark cards with subtle borders |
| Button style | Rounded corners, accent-colored CTAs |
| Overall vibe | Military/athletic premium, dark and clean |

**Badge Tiers (with gender-specific pull-up requirements):**

| Tier | Male | Female |
|------|------|--------|
| Recruit | 5 | 3 |
| Proven | 10 | 7 |
| Hardened | 15 | 12 |
| Operator | 20 | 15 |
| Elite | 25 | 20 |

---

## Step 2: Connect All Integrations (Do This BEFORE Running Prompts)

### 2a. Connect Supabase to Lovable

This is the most important step — Supabase is the entire backend (database, auth, edge functions).

**Where to find your Supabase credentials:**
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and log in
2. Select the **Pull-Up Club** project
3. Go to **Settings** (gear icon in left sidebar) > **API**
4. You'll see two things you need:
   - **Project URL** — looks like `https://yqnikgupiaghgjtsaypr.supabase.co`
   - **anon / public key** — a long string starting with `eyJ...`

**How to connect in Lovable:**
1. Open your Lovable project
2. Click the **Supabase button** in the top-right corner of the editor
3. Follow the prompts to link your existing Supabase project
4. Lovable will automatically set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`

> **Important:** Connect to the EXISTING Pull-Up Club Supabase project. Do NOT create a new one — all our database tables, edge functions, and user data are already there.

---

### 2b. Connect Stripe

Stripe handles subscriptions, checkout, and the customer portal.

**Where to find your Stripe keys:**
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) and log in
2. Click **Developers** in the top-right
3. Click **API Keys** in the left sidebar
4. You'll see:
   - **Publishable key** — starts with `pk_live_...` (or `pk_test_...` for test mode)
   - **Secret key** — click "Reveal" — starts with `sk_live_...` (or `sk_test_...`)

**Where to find the Webhook Secret:**
1. In Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click on the webhook endpoint for Pull-Up Club
3. Click **Reveal** next to "Signing secret" — starts with `whsec_...`

**How to add in Lovable:**
1. In Lovable, do NOT paste keys in the chat
2. Use the **"Add API Key"** button that Lovable shows when it detects Stripe is needed
3. Add these three keys:
   - `STRIPE_SECRET_KEY` → your `sk_live_...` or `sk_test_...` key
   - `STRIPE_WEBHOOK_SECRET` → your `whsec_...` key
   - `VITE_STRIPE_PUBLISHABLE_KEY` → your `pk_live_...` or `pk_test_...` key

> **Tip:** Start with **test mode keys** (`pk_test_...` / `sk_test_...`) until everything is verified working. Switch to live keys only when ready to launch.

**Stripe Price IDs:**
1. Go to Stripe Dashboard > **Product Catalog**
2. Find the Pull-Up Club Monthly and Annual subscription products
3. Click into each one and copy the **Price ID** (starts with `price_...`)
4. Add these as Supabase secrets:
   - Go to Supabase Dashboard > **Edge Functions** > **Manage Secrets**
   - Add: `STRIPE_MONTHLY_PRICE_ID` → your monthly `price_...` ID
   - Add: `STRIPE_ANNUAL_PRICE_ID` → your annual `price_...` ID

---

### 2c. Connect Resend (Transactional Emails)

Resend sends automated emails like welcome emails, submission approvals/rejections, and payment reminders.

**Where to find your Resend API key:**
1. Go to [resend.com/api-keys](https://resend.com/api-keys) and log in
2. Copy your existing API key, or create a new one by clicking **Create API Key**
3. The key looks like `re_...`

**How to add:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) > select Pull-Up Club project
2. Go to **Edge Functions** in the left sidebar
3. Click **Manage Secrets**
4. Add: `RESEND_API_KEY` → your `re_...` key
5. Click **Save**

---

### 2d. Connect Klaviyo (Email Marketing)

Klaviyo is for marketing emails, newsletters, and automated email campaigns (separate from Resend's transactional emails).

**Where to find your Klaviyo API key:**
1. Go to [klaviyo.com](https://www.klaviyo.com) and log in
2. Click your account name (bottom-left) > **Settings**
3. Go to **API Keys** (under Account > Settings)
4. Copy your **Private API Key**, or create a new one
5. The key looks like `pk_...`

**How to add:**
1. Go to Supabase Dashboard > **Edge Functions** > **Manage Secrets**
2. Add: `KLAVIYO_API_KEY` → your private API key
3. Click **Save**

---

### 2e. Connect Google Analytics (GA4)

GA4 tracks page views, user behavior, and conversions.

**Where to find your Measurement ID:**
1. Go to [analytics.google.com](https://analytics.google.com)
2. Click the gear icon (**Admin**) in the bottom-left
3. Under your property, click **Data Streams**
4. Click your web stream
5. Copy the **Measurement ID** — it's `G-5NV54P8K1L`

**How to add:**
- This gets added directly in the code. When you run **Prompt 10**, tell Lovable to use measurement ID `G-5NV54P8K1L`
- It's already included in the prompt

---

### 2f. Connect Meta / Facebook Pixel

The Meta Pixel tracks conversions and enables retargeting ads.

**Where to find your Pixel ID and Access Token:**
1. Go to [business.facebook.com](https://business.facebook.com)
2. Click the hamburger menu > **Events Manager**
3. Select your Pixel — copy the **Pixel ID** (a number like `123456789`)
4. For the **Access Token** (needed for server-side Conversions API):
   - In Events Manager, click **Settings**
   - Scroll to **Conversions API**
   - Click **Generate Access Token** (or copy existing)
   - The token is a long string

**How to add:**
1. Go to Supabase Dashboard > **Edge Functions** > **Manage Secrets**
2. Add: `META_PIXEL_ID` → your pixel ID number
3. Add: `META_ACCESS_TOKEN` → your access token string
4. Click **Save**

---

## Step 3: Build in Lovable (Run Prompts In Order, One at a Time)

**Why individual prompts instead of one big one?**
- **Lovable has a context limit** — one giant prompt with all 10 pages would exceed it or cause Lovable to cut corners on the later sections
- **Easier to catch mistakes** — if a prompt goes wrong, you can iterate on just that page without Lovable trying to redo everything
- **Each prompt builds on the last** — Lovable keeps the project state between prompts, so Prompt 2 automatically inherits the layout from Prompt 1
- **Edit mode works better** — if something looks off, use Lovable's Edit mode to tweak just that page instead of regenerating the whole app

### Prompt 1: Project Setup + Global Layout

**Paste with this prompt:** Screenshot of the current site's header and footer.

> Build a premium dark-themed fitness competition web app called "Pull-Up Club". Use these design tokens: accent color #9b9b6f, Inter font, dark background #0a0a0a. Create a sticky header with logo, nav links (Home, Leaderboard, Ethos), auth-aware buttons (Sign Up / Login when logged out, Profile / Logout when logged in), and a mobile hamburger menu. Create a footer with 3 columns: description, quick links, and contact info with social media icons (Facebook, Instagram, YouTube). The overall feel should be military/athletic premium. Make sure the layout is fully responsive on mobile.

**After this prompt:** Upload the PUC logo from Google Drive and tell Lovable: "Replace the logo placeholder in the header with this image."

### Prompt 2: Home Page

**Paste with this prompt:** Screenshots of the current home page (full scroll — hero, how it works, perks, leaderboard preview, testimonials, CTA).

> Build the home page with these sections in order: (1) Full-width hero with a dark background image, animated stat counters (warriors joined, pull-ups today, badge types), and two CTA buttons. (2) "How It Works" - 3 steps: Record & Submit, Get Judged, Climb Leaderboard. (3) Perks section - grid of benefit cards (badges, $250 weekly prizes, community). (4) Leaderboard preview showing top 5 entries with a "View Full Leaderboard" link. (5) Testimonials section. (6) Final CTA section. Use accent color #9b9b6f for all buttons and highlights. Make sure all sections are responsive on mobile.

**After this prompt:** Review the generated text carefully. Lovable will write placeholder copy — replace it with the real text from the current site. Use Edit mode to update headlines, descriptions, and testimonials one section at a time.

### Prompt 3: Auth Flow

**Paste with this prompt:** Screenshots of the current login and sign-up pages.

> Add authentication pages: (1) Login page with email/password form and "Forgot password?" link. (2) Sign-up form with password strength validation (min 6 chars, uppercase, lowercase, number). (3) Reset password request form. (4) New password entry page. Use Supabase Auth — connect to our existing Supabase project, do NOT create new auth tables. Style all forms centered with the PUC logo above. After login, redirect based on subscription status. Make forms responsive on mobile.

### Prompt 4: Subscription / Stripe Checkout

**Paste with this prompt:** Screenshot of the current pricing/subscription page.

> Add a subscription page with two plan cards: Monthly ($9.99/mo) and Annual ($99.99/yr, showing savings). Wire up Stripe Checkout using our existing Supabase Edge Functions — call the existing `create-checkout` Edge Function, do NOT create a new one. After successful payment, redirect to a success page, then to profile. Add a "Manage Subscription" button that calls the existing `customer-portal` Edge Function. Include a post-payment account setup page at /signup-access for new users to complete their profile.

### Prompt 5: Profile Page (4 tabs)

**Paste with this prompt:** Screenshots of each profile tab (Submissions, Rankings, Settings, Subscription).

> Build a profile page with 4 tabs: (1) Submissions — shows user's submission history with status badges (pending/approved/rejected) and embedded videos. Read from the existing `submissions` table in Supabase, do NOT create a new table. (2) Rankings — user's position on leaderboard from the existing `user_best_submissions` view. (3) Settings — editable form for name, age, gender, organization, region, phone, social media, plus password change. Updates the existing `profiles` table. (4) Subscription — status display, manage subscription button (calls existing `customer-portal` Edge Function), PUC Bank earnings display from existing `user_earnings` table, badge progress tracker showing the 5 tiers: Recruit, Proven, Hardened, Operator, Elite.

**After this prompt:** Upload the badge icons from Google Drive and tell Lovable to use them in the badge progress tracker.

### Prompt 6: Video Submission Page

**Paste with this prompt:** Screenshot of the current video submission page.

> Build a protected video submission page (requires active subscription — check the existing `profiles.is_paid` field). Form fields: video URL (YouTube, TikTok, or Instagram), pull-up count claimed. Show competition rules inline (hand width requirements, video standards, 30-day cooldown between approved submissions). Validate URL format. Call the existing `video-submission` Edge Function to store the submission, do NOT create a new Edge Function or table. The existing `check-submission-eligibility` Edge Function handles cooldown validation — call it before allowing submission. Show a success message after submission.

### Prompt 7: Leaderboard Page

**Paste with this prompt:** Screenshot of the current leaderboard page including filters and badge legend.

> Build the full leaderboard page with: (1) Filter bar — gender, organization (dropdown), region, pull-up range, badge level. (2) Paginated table showing rank, name, pull-ups, badge icon, organization, region, and expandable rows with video embeds. (3) Badge legend showing all 5 tiers with gender-specific requirements — Male: Recruit 5, Proven 10, Hardened 15, Operator 20, Elite 25 / Female: Recruit 3, Proven 7, Hardened 12, Operator 15, Elite 20. (4) PUC Bank banner showing weekly $250 prize pool status from the existing `weekly_pools` table. Read leaderboard data from the existing `user_best_submissions` view in Supabase, do NOT create a new table or view.

**After this prompt:** Upload the badge icons from Google Drive if not already done, and tell Lovable to use them next to each tier in the legend and table.

### Prompt 8: Admin Dashboard

**Paste with this prompt:** Screenshots of the current admin dashboard and admin payouts page.

> Build an admin-only dashboard at /admin-dashboard. Protect the route by checking the existing `admin_roles` table — if the user is not an admin, redirect to home. Show stats cards (total users, paid users, submissions by status). List all submissions with filters (month, status, search), pagination (50/page). Each submission row has: approve button (with actual pull-up count input), reject button, admin notes field. Call the existing `admin-submissions` Edge Function for approve/reject actions, do NOT create a new one. Add a separate /admin-payouts page that reads from the existing `payout_requests` table and calls the existing `request-payout` and `mark-payout-paid` Edge Functions.

### Prompt 9: Static Pages + i18n

**Paste with this prompt:** Screenshots of the current Ethos, FAQ, and Rules pages.

> Add these static pages: (1) Ethos — "The Legend of Alkeios" story page with hero image and 3 core values (Strength, Community, Health). (2) FAQ — expandable accordion sections. (3) Rules — competition rules page. (4) Privacy Policy. (5) Cookie Policy. Add i18next with language selector in the header supporting 9 languages: en, es, fr, de, pt, zh, ja, ko, ar.

**After this prompt:** The generated text on these pages will be placeholder. Go through each page in Edit mode and replace with the real content from the current site. For the Ethos page, copy the full "Legend of Alkeios" story. For FAQ, copy all the real questions and answers. For Rules, copy the actual competition rules. For Privacy Policy and Cookie Policy, copy the current legal text.

### Prompt 10: Analytics + Final Wiring

> Add Google Analytics (GA4) tracking with measurement ID `G-5NV54P8K1L`. Add Meta/Facebook Pixel with server-side Conversions API via the existing Supabase Edge Function — do NOT create a new Edge Function for this. Verify all existing Supabase Edge Functions are properly connected: create-checkout, stripe-webhooks, admin-submissions, video-submission, subscription-status, cancel-subscription, customer-portal, check-submission-eligibility, welcome-flow, request-payout, mark-payout-paid. Make sure all pages include proper meta tags and page titles for SEO.

---

## Step 4: Deploy from Lovable

Once you've verified everything looks good in Lovable's preview:

1. Click the **"Publish"** button in the top-right of Lovable
2. Lovable will give you a default URL (something like `your-app.lovable.app`) — use this to test everything end-to-end first
3. To add your real domain (e.g., pullupclub.com):
   - Go to your Lovable project > **Settings** > **Domains**
   - Click **"Add custom domain"**
   - Lovable will give you DNS records (an `A` record and a `TXT` record)
   - Go to your domain registrar and add those records (see Step 7 below for DNS details)
   - Wait for DNS to propagate (can take a few minutes to a few hours)
4. **Note:** You need a paid Lovable plan to use a custom domain

> **Important:** Do NOT point your real domain to Lovable until you've fully tested on the default `.lovable.app` URL first. Test login, signup, payments, submissions, admin — everything.

---

## Step 5: Before Going Live (Critical Configuration Updates)

These steps connect your new Lovable site to the existing backend. **If you skip these, auth, payments, and emails will break.**

### 5a. Update Supabase Auth Redirect URLs

When users click links in confirmation emails, password reset emails, or magic links, Supabase redirects them to a URL. Right now those URLs point to the old Vercel site. You need to add the new Lovable URL.

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) > select Pull-Up Club project
2. Go to **Authentication** in the left sidebar
3. Click **URL Configuration**
4. You'll see:
   - **Site URL** — change this to your new Lovable domain (e.g., `https://pullupclub.com` or `https://your-app.lovable.app` while testing)
   - **Redirect URLs** — add your new Lovable domain here. Keep the old Vercel URL until you're ready to fully switch over. Add both:
     - `https://your-app.lovable.app/**` (for testing)
     - `https://pullupclub.com/**` (for production)
5. Click **Save**

> **If you skip this:** Users will click "Confirm Email" or "Reset Password" in their email and get sent to the old dead Vercel site instead of the new one. Auth will be completely broken.

### 5b. Update Edge Function CORS / Hardcoded URLs

Some Edge Functions may have the old Vercel domain hardcoded in them (for CORS headers, redirect URLs, etc.). You need to check and update these.

1. Go to Supabase Dashboard > **Edge Functions**
2. Check these functions for hardcoded URLs — look for the old domain name (e.g., `pullupclub.vercel.app` or `pullupclub.com`):
   - `create-checkout` — the `success_url` and `cancel_url` that Stripe redirects to after payment
   - `customer-portal` — the `return_url` that Stripe sends users back to after managing their subscription
   - `welcome-flow` — any links in welcome emails pointing to the old site
   - `stripe-webhooks` — any redirect or response URLs
3. Update any old URLs to your new Lovable domain
4. Redeploy the updated Edge Functions

> **If you skip this:** Stripe checkout will redirect users to the old dead site after payment. Welcome emails will link to the wrong URL. Users will get confused and payments may not complete properly.

### 5c. Add Lovable Domain to Supabase CORS

1. Go to Supabase Dashboard > **Settings** > **API**
2. Under **Allowed origins** (if configured), add your new Lovable domain
3. This ensures the new frontend can make API calls to Supabase without being blocked

---

## Step 6: Post-Build Verification Checklist

Run through this entire checklist on the new Lovable site BEFORE decommissioning the old one.

- [ ] All pages render with correct dark theme + #9b9b6f accent
- [ ] Auth flow works (sign up, login, logout, reset password)
- [ ] Stripe checkout creates subscription + updates `profiles.is_paid`
- [ ] Video submission form validates and stores to `submissions` table
- [ ] Admin can approve/reject submissions, actual count triggers badges + earnings
- [ ] Leaderboard loads from `user_best_submissions`, filters work
- [ ] PUC Bank shows correct weekly pool status
- [ ] Profile tabs all load correct data
- [ ] Stripe Customer Portal accessible
- [ ] Welcome email sends on new subscription
- [ ] i18n language switcher works
- [ ] Analytics firing (GA4 + Meta Pixel)
- [ ] Admin routes protected from non-admin users
- [ ] 30-day submission cooldown enforced
- [ ] All pages are responsive on mobile
- [ ] Badge icons display correctly for all 5 tiers
- [ ] Real content (not placeholder text) on all static pages

---

## Step 7: Decommission the Old Site

**Only do this after EVERY item in the checklist above is checked off.** Once you take down the old site, there's no going back without redeploying it.

### 7a. Take Down the Vercel Deployment

This removes the old Next.js site so users don't end up on two different versions.

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) and log in
2. Find the **Pull-Up Club** project
3. Click into the project > **Settings** (top nav)
4. Scroll all the way to the bottom to the **"Delete Project"** section
5. If you want to be safe, **don't delete it yet** — instead go to **Settings** > **Domains** and remove the custom domain first. This takes the site offline but keeps the project in Vercel in case you need to roll back.
6. Point your custom domain (e.g., pullupclub.com) to the new Lovable deployment instead
7. Once you're confident the new site is stable (give it a few days), come back and delete the Vercel project

> **Safer alternative:** Instead of deleting, you can just **pause** the project. Go to Settings > General > scroll to "Pause Project". This keeps everything intact but takes the site offline.

### 7b. Update the Stripe Webhook Endpoint

Stripe is currently sending webhook events (subscription created, payment succeeded, etc.) to the old Vercel URL. You need to point it to the new Lovable/Supabase URL instead.

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) > **Developers** > **Webhooks**
2. Click on the existing webhook endpoint — it probably points to something like `https://your-old-site.vercel.app/api/webhooks/stripe` or your old custom domain
3. Click **"Update endpoint"** and change the URL to your Supabase Edge Function URL: `https://yqnikgupiaghgjtsaypr.supabase.co/functions/v1/stripe-webhooks`
4. Make sure the events being listened to are still the same (don't remove any)
5. **Test it:** Make a test purchase on the new site and check that the webhook fires successfully (you'll see a green checkmark in the Stripe webhook logs)

> **Important:** If you already had a webhook pointing to the Supabase Edge Function (in addition to the Vercel one), you may just need to delete the old Vercel webhook. Check how many endpoints you have — you only need one.

### 7c. Update Resend (Transactional Emails)

If Resend is sending emails through the old Vercel API routes, you need to make sure it's now routing through Supabase Edge Functions.

1. Go to [resend.com](https://resend.com) and log in
2. Check **Domains** — make sure your sending domain (e.g., pullupclub.com) is still verified
3. Check **Webhooks** (if configured) — update any webhook URLs from the old Vercel domain to the new one
4. No other changes needed — the `RESEND_API_KEY` in Supabase Edge Functions handles the actual sending

### 7d. Update Klaviyo

1. Go to [klaviyo.com](https://www.klaviyo.com) and log in
2. Go to **Settings** > **Integrations**
3. If there's a website integration or JavaScript snippet pointing to the old domain, update it to the new Lovable domain
4. Update any **signup forms** or **embedded forms** that reference the old URL
5. Check **Flows** — if any automated flows have links back to the old site (e.g., "View your profile" links in emails), update those URLs to the new domain

### 7e. Update Meta / Facebook Pixel

1. Go to [business.facebook.com](https://business.facebook.com) > **Events Manager**
2. Select your Pixel > **Settings**
3. Under **Website**, update the domain to your new Lovable site URL
4. If you have a **Conversions API** partner integration set up, verify the server-side events are still flowing (the Supabase Edge Function handles this, so it should be fine as long as the secrets are set)

### 7f. Update Google Analytics

1. Go to [analytics.google.com](https://analytics.google.com) > **Admin** > **Data Streams**
2. Click your web stream
3. Update the **Website URL** to your new Lovable domain
4. The measurement ID (`G-5NV54P8K1L`) stays the same — it's already in the new site's code from Prompt 10

### 7g. Update DNS / Custom Domain

If pullupclub.com (or whatever your domain is) currently points to Vercel:

1. Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. Update the **CNAME** or **A record** to point to your new Lovable deployment URL instead of Vercel
3. Lovable will give you the DNS records to use when you set up a custom domain in their platform

### 7h. Final Sanity Check

After making all the changes above, verify:
- [ ] Old Vercel site is no longer accessible
- [ ] New Lovable site loads on your custom domain
- [ ] Stripe webhooks are firing to the new endpoint (check Stripe webhook logs)
- [ ] A test signup/payment works end to end
- [ ] Emails still send (try triggering a welcome email)
- [ ] Google Analytics is receiving events (check Real-Time report)
- [ ] Meta Pixel is firing (use the Meta Pixel Helper Chrome extension)
- [ ] Klaviyo forms and tracking still work

---

## Phase 2: Multi-Exercise Expansion

Right now, Pull-Up Club is built around one exercise: pull-ups. This section outlines how to expand it into a multi-exercise fitness platform where users can compete in categories like max bench, max squat, fastest mile, push-ups, and more.

**Do NOT start this until the Lovable rebuild is live and stable.** Get Phase 1 (the current pull-up platform) working perfectly first, then layer this on top.

### The Challenge: Different Exercises Score Differently

This is the biggest thing to understand. Pull-ups are simple — more is better. But different exercises measure differently:

| Scoring Type | Examples | How it works |
|---|---|---|
| **Count-based** | Pull-ups, push-ups, sit-ups | Higher number wins |
| **Weight-based** | Bench press, squat, deadlift | Higher weight wins |
| **Time-based** | Mile run, 5K, plank hold | Lower time wins (faster = better) |

This means the leaderboard can't just sort "highest number first" for everything. It needs to know which direction to sort for each exercise. Badge thresholds also change completely — 10 pull-ups is impressive, but a 10lb bench press is not.

### Decisions You Need to Make First

Before building anything, decide on these:

**1. Is it still "Pull-Up Club" or does it rebrand?**
If you add bench press and mile runs, "Pull-Up Club" doesn't make sense anymore. Options:
- Keep "Pull-Up Club" as the brand but add sub-categories (like how UFC is still called UFC even though it has multiple weight classes)
- Rebrand to something broader (e.g., "PUC Fitness", "The Proving Ground")
- Keep "Pull-Up Club" as the flagship and launch separate brands per exercise (most complex, not recommended)

**2. One prize pool or separate pools per exercise?**
- **One shared pool ($250/week):** Simpler, but a pull-up champion is competing against a bench press champion — doesn't make sense
- **Separate pools per exercise ($250/week each):** Fairer, but costs more. 5 exercises = $1,250/week in prize pools
- **Rotating spotlight:** One exercise gets the prize pool each week on rotation. Cheapest, but users only compete for money 1 out of every N weeks
- **Recommendation:** Start with separate pools for 2-3 exercises, see if revenue supports it

**3. Same badge tier names across all exercises?**
- **Yes (recommended):** Recruit, Proven, Hardened, Operator, Elite for every exercise — just different thresholds. Keeps the brand consistent and simple.
- **No:** Different badge names per exercise. More creative but much more complex and confusing for users.

**4. One subscription covers everything?**
- **Yes (recommended):** Users pay $9.99/mo and can compete in any exercise. Simplest, most value for users.
- **No:** Pay per exercise or tiered plans. Adds complexity and friction — not worth it early on.

**5. Can your team handle more judging?**
Every new exercise means more video submissions to review. If you have 150 users doing pull-ups, adding 4 more exercises could mean 5x the admin workload. Consider:
- Start with just 1-2 new exercises
- Pick exercises that are easy to judge from video
- Eventually consider community judging or AI-assisted judging

### Database Changes Needed

**New table: `exercises`**
```
id (uuid) — primary key
name (text) — "Pull-Ups", "Bench Press", "Mile Run"
slug (text) — "pull-ups", "bench-press", "mile-run"
scoring_type (text) — "count", "weight", "time"
unit (text) — "reps", "lbs", "minutes:seconds"
sort_direction (text) — "desc" (higher is better) or "asc" (lower is better)
is_active (boolean) — whether this exercise is currently available
icon_url (text) — exercise icon for the UI
created_at (timestamp)
```

**Add columns to existing tables:**
- `submissions` → add `exercise_id` (foreign key to exercises)
- `badges` → add `exercise_id` (badge thresholds become per-exercise)
- `user_badges` → add `exercise_id` (users earn badges per exercise)
- `weekly_pools` → add `exercise_id` (if doing per-exercise pools)
- `weekly_earnings` → add `exercise_id`

**Update existing views:**
- `user_best_submissions` → best submission per user **per exercise**
- `leaderboard_cache` → partitioned by exercise

**Backfill existing data:**
- Create a "Pull-Ups" row in the `exercises` table
- Set `exercise_id` on all existing submissions, badges, earnings to the Pull-Ups ID
- Everything continues to work exactly as before

### How to Phase the Build

**Phase 2a: Schema prep (can do anytime)**
1. Create the `exercises` table
2. Add `exercise_id` columns to existing tables (nullable at first)
3. Backfill all existing data with the Pull-Ups exercise ID
4. Make `exercise_id` NOT NULL after backfill
5. Update the `user_best_submissions` view and `leaderboard_cache` to include exercise filtering
6. **Nothing changes for users yet** — the app works exactly the same

**Phase 2b: Frontend updates**
1. Add an exercise selector dropdown to the **submission form** (but only Pull-Ups is available initially)
2. Add an exercise filter to the **leaderboard page**
3. Add exercise tabs or filter to the **profile page** (submissions and badges per exercise)
4. Update the **admin dashboard** to filter submissions by exercise
5. Add an **admin exercise management page** to create/edit exercises and set badge thresholds

**Phase 2c: Launch new exercises**
1. Start with **2-3 exercises** that are easy to judge from video:
   - Push-ups (count-based, same as pull-ups — easiest to add)
   - Bodyweight squats or weighted squats (count or weight-based)
   - Plank hold (time-based — good test of time scoring)
2. Create badge thresholds for each new exercise
3. Set up prize pools (decide on shared vs separate)
4. Announce to users and open submissions

**Phase 2d: Scale up**
- Add more exercises based on user demand
- Consider user-submitted exercise suggestions
- Add exercise categories (Strength, Endurance, Bodyweight)
- Consider seasonal/monthly featured exercises

### What the Submission Flow Looks Like After

1. User goes to Submit page
2. Selects exercise from dropdown (Pull-Ups, Bench Press, Mile Run, etc.)
3. Form fields adjust based on exercise:
   - Pull-ups: "How many reps?" + video URL
   - Bench press: "How much weight (lbs)?" + video URL
   - Mile run: "What was your time?" (mm:ss format) + video URL
4. Competition rules display for the selected exercise (each exercise has its own rules)
5. Submission stored with `exercise_id`
6. Admin reviews and approves/rejects as usual
7. Badges awarded based on that exercise's thresholds
8. Leaderboard updates for that exercise

### What the Leaderboard Looks Like After

- Top of page: exercise selector tabs or dropdown (Pull-Ups | Bench Press | Mile Run | ...)
- Each exercise has its own leaderboard sorted by its scoring direction
- Badge icons still show next to names, but they're exercise-specific
- Filters (gender, org, region) still work within each exercise
- PUC Bank banner shows the pool for the selected exercise

### Quick-Start Shortcut

If you want to plant the seed in the current Lovable build without doing any backend work yet, add this to the submission form prompt:

> "Add a dropdown at the top of the submission form labeled 'Exercise' with only one option: 'Pull-Ups (default)'. Make it disabled/greyed out with a tooltip that says 'More exercises coming soon'. This is a placeholder for future expansion."

This costs nothing to build, signals to users that more is coming, and means the UI is already partially ready when you do Phase 2.

---

## Stripe Automated Payouts (Future Upgrade — Read This Carefully)

Right now, PUC Bank payouts work like this: admin manually reviews who earned what, then sends PayPal payments one by one. Stripe Connect could automate this entire process. Here's the full breakdown.

### How Stripe Connect Works

Stripe Connect is a system where your platform (Pull-Up Club) can automatically send money to users' bank accounts. Instead of PayPal, users link their bank account directly through Stripe. Then when they earn PUC Bank money, it gets transferred automatically — no manual PayPal payments needed.

### What the Setup Process Looks Like

**Step 1: Enable Stripe Connect on your Stripe account**
1. Go to Stripe Dashboard > **Settings** > **Connect**
2. Enable Connect and choose **"Express"** account type (simplest for users)
3. Configure your branding (logo, colors) for the onboarding flow

**Step 2: Add a "Connect Your Bank" flow to the app**
- On the user's Profile page (Subscription tab), add a button: **"Connect Bank Account for Payouts"**
- When a user clicks it, they get redirected to a Stripe-hosted onboarding page
- Stripe walks them through entering their bank details, verifying identity, etc.
- Once done, they're redirected back to Pull-Up Club
- Their Stripe connected account ID gets stored in the `profiles` table

**Step 3: Build an Edge Function to automate transfers**
- When admin approves a payout (or on a weekly cron schedule), an Edge Function calls Stripe's Transfer API
- Example: "Send $12.50 to user X's connected account"
- Stripe handles the actual bank transfer — funds arrive in 1-2 business days
- The payout status updates automatically in the database

**Step 4: Configure automatic payout schedule**
- You can set payouts to happen daily, weekly (e.g. every Monday), or monthly
- Stripe handles the scheduling — no cron jobs or manual work needed

### What Would Need to Change in Pull-Up Club

| Current (PayPal) | New (Stripe Connect) |
|---|---|
| Users enter PayPal email in profile | Users link bank account via Stripe onboarding |
| Admin manually sends PayPal payments | Edge Function automatically transfers via Stripe API |
| `payout_requests` table tracks PayPal status | Same table tracks Stripe transfer IDs instead |
| Admin clicks "Mark as Paid" manually | Stripe webhooks auto-update payment status |
| Users wait for admin to process | Funds auto-transfer on schedule |

### Database Changes Needed
- Add `stripe_connect_account_id` column to `profiles` table
- Add `stripe_transfer_id` column to `payout_requests` table
- New Edge Function: `connect-onboarding` (creates Stripe account link for user)
- New Edge Function: `process-automated-payouts` (transfers funds to connected accounts)
- New webhook handler for `transfer.paid` and `transfer.failed` events

### Pros
- **No more manual PayPal payments** — saves admin hours every week
- **Faster for users** — funds arrive in 1-2 business days automatically
- **Everything in one system** — subscriptions AND payouts both through Stripe
- **Automatic record-keeping** — every transfer is tracked with a Stripe ID
- **Professional experience** — users see a real Stripe onboarding flow, builds trust
- **Scalable** — works the same whether you have 50 users or 5,000

### Cons
- **Stripe takes a fee** — $0.25 per payout + 0.25% of the amount (so on a $12.50 payout, Stripe takes ~$0.28)
- **Users must complete Stripe onboarding** — they need to verify identity, link a bank account. Some users may not want to do this or may find it confusing
- **Existing users need to switch** — everyone currently using PayPal would need to go through the Stripe onboarding process
- **Development work** — need new Edge Functions, database changes, and frontend UI updates. Estimate 2-3 days of dev work
- **US/international complexity** — Stripe Connect availability varies by country. If you have users outside the US, some may not be able to use it
- **No PayPal option** — users who prefer PayPal would lose that option (unless you keep both systems, which adds complexity)

### Recommendation

**Don't do this during the Lovable rebuild.** Get the new frontend live and stable first. Then consider Stripe Connect as a Phase 2 upgrade. When you're ready:

1. Start by offering it as an **optional** alternative to PayPal
2. Let new users choose between PayPal and Stripe Connect
3. Gradually migrate existing users over time
4. Once most users are on Stripe Connect, you can retire the PayPal flow

---

## Important Notes

1. **Lovable generates client-side SPAs** — no SSR/SSG. SEO will differ from the current Next.js setup.
2. **Complex business logic** (badge calculations, earnings processing, leaderboard materialized views) lives in Supabase, not in the frontend — this transfers directly.
3. **Lovable gets you ~70% there** — expect manual refinement for pixel-perfect matching, complex admin workflows, and edge cases.
4. **Keep the existing Supabase project** — the database, Edge Functions, and auth all stay. Only the frontend is being rebuilt.
5. **Test in Stripe test mode first** before switching to live keys.
