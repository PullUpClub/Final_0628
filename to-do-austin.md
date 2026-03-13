# Pull-Up Club: Lovable Rebuild — Austin's Guide

## Lovable Prompts (run in order, one at a time)

### Prompt 1: Project Setup + Global Layout
> Build a premium dark-themed fitness competition web app called "Pull-Up Club". Use these design tokens: accent color #9b9b6f, Inter font, dark background #0a0a0a. Create a sticky header with logo, nav links (Home, Leaderboard, Ethos), auth-aware buttons (Sign Up / Login when logged out, Profile / Logout when logged in), and a mobile hamburger menu. Create a footer with 3 columns: description, quick links, and contact info with social media icons (Facebook, Instagram, YouTube). The overall feel should be military/athletic premium.

### Prompt 2: Home Page
> Build the home page with these sections in order: (1) Full-width hero with a dark background image, animated stat counters (warriors joined, pull-ups today, badge types), and two CTA buttons. (2) "How It Works" - 3 steps: Record & Submit, Get Judged, Climb Leaderboard. (3) Perks section - grid of benefit cards (badges, $250 weekly prizes, community). (4) Leaderboard preview showing top 5 entries with a "View Full Leaderboard" link. (5) Testimonials section. (6) Final CTA section. Use accent color #9b9b6f for all buttons and highlights.

### Prompt 3: Auth Flow
> Add authentication pages: (1) Login page with email/password form and "Forgot password?" link. (2) Sign-up form with password strength validation (min 6 chars, uppercase, lowercase, number). (3) Reset password request form. (4) New password entry page. Use Supabase Auth. Style all forms centered with the PUC logo above. After login, redirect based on subscription status.

### Prompt 4: Subscription / Stripe Checkout
> Add a subscription page with two plan cards: Monthly ($9.99/mo) and Annual ($99.99/yr, showing savings). Wire up Stripe Checkout. After successful payment, redirect to a success page, then to profile. Add a "Manage Subscription" button that opens Stripe Customer Portal. Include a post-payment account setup page at /signup-access for new users to complete their profile.

### Prompt 5: Profile Page (4 tabs)
> Build a profile page with 4 tabs: (1) Submissions - shows user's submission history with status badges (pending/approved/rejected) and embedded videos. (2) Rankings - user's position on leaderboard. (3) Settings - editable form for name, age, gender, organization, region, phone, social media, plus password change. (4) Subscription - status display, manage subscription button, PUC Bank earnings display, badge progress tracker.

### Prompt 6: Video Submission Page
> Build a protected video submission page (requires active subscription). Form fields: video URL (YouTube, TikTok, or Instagram), pull-up count claimed. Show competition rules inline (hand width requirements, video standards, 30-day cooldown between approved submissions). Validate URL format. Store as "pending" status in submissions table. Show a success message after submission.

### Prompt 7: Leaderboard Page
> Build the full leaderboard page with: (1) Filter bar - gender, organization (dropdown), region, pull-up range, badge level. (2) Paginated table showing rank, name, pull-ups, badge icon, organization, region, and expandable rows with video embeds. (3) Badge legend showing all tiers with gender-specific requirements (Male: 5/10/15/20/25, Female: 3/7/12/15/20). (4) PUC Bank banner showing weekly $250 prize pool status. Data comes from user_best_submissions view.

### Prompt 8: Admin Dashboard
> Build an admin-only dashboard at /admin-dashboard. Show stats cards (total users, paid users, submissions by status). List all submissions with filters (month, status, search), pagination (50/page). Each submission row has: approve button (with actual pull-up count input), reject button, admin notes field. Add a separate /admin-payouts page for managing weekly payouts. Protect both routes with admin role check.

### Prompt 9: Static Pages + i18n
> Add these static pages: (1) Ethos - "The Legend of Alkeios" story page with hero image and 3 core values (Strength, Community, Health). (2) FAQ - expandable accordion sections. (3) Rules - competition rules page. (4) Privacy Policy. (5) Cookie Policy. Add i18next with language selector in the header supporting 9 languages: en, es, fr, de, pt, zh, ja, ko, ar.

### Prompt 10: Analytics + Final Wiring
> Add Google Analytics (GA4) tracking. Add Meta/Facebook Pixel with server-side Conversions API via Supabase Edge Function. Add a Chatbase chatbot widget. Ensure all Supabase Edge Functions are connected: create-checkout, stripe-webhooks, admin-submissions, video-submission, subscription-status, cancel-subscription, customer-portal, check-submission-eligibility, welcome-flow, request-payout, mark-payout-paid.

---

## Environment Variables & Secrets

### Supabase (auto-configured when connected to Lovable)
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — your Supabase anon key

### Stripe (add via Lovable's "Add API Key" UI, NOT in chat)
- `STRIPE_SECRET_KEY` — from Stripe Dashboard > Developers > API Keys
- `STRIPE_WEBHOOK_SECRET` — from Stripe Dashboard > Webhooks
- `VITE_STRIPE_PUBLISHABLE_KEY` — public key for frontend

### Other Secrets (add in Supabase Dashboard > Edge Functions > Secrets)
- `RESEND_API_KEY` — for transactional emails
- `META_PIXEL_ID` + `META_ACCESS_TOKEN` — for Facebook Conversions API
- `CHATBASE_BOT_ID` — for chatbot widget
- `GA_MEASUREMENT_ID` — Google Analytics (currently hardcoded as `G-5NV54P8K1L`)

### Stripe Product Migration
Either:
- **Reuse existing Stripe products** — keep the same `price_xxx` IDs in your new Supabase secrets
- **Create new products** in Stripe if starting fresh, then update the price IDs

---

## Post-Build Verification Checklist

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

---

## Important Notes

1. **Lovable generates client-side SPAs** — no SSR/SSG. SEO will differ from the current Next.js setup.
2. **Complex business logic** (badge calculations, earnings processing, leaderboard materialized views) lives in Supabase, not in the frontend — this transfers directly.
3. **Lovable gets you ~70% there** — expect manual refinement for pixel-perfect matching, complex admin workflows, and edge cases.
4. **Keep the existing Supabase project** — the database, Edge Functions, and auth all stay. Only the frontend is being rebuilt.
5. **Test in Stripe test mode first** before switching to live keys.
