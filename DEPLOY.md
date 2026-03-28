# LumLoop MVP — Deployment Guide

## For lumloop.com on DigitalOcean App Platform

### Prerequisites
- GitHub account
- DigitalOcean account
- Domain: lumloop.com (DNS access)

---

## Step 1: Push to GitHub

```bash
# Create a new GitHub repo called "lumloop"
# Then push the code:
cd lumloop-mvp
git remote add origin git@github.com:YOUR_USERNAME/lumloop.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy on DigitalOcean App Platform

### Option A: Via Dashboard (easiest)
1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Select GitHub as source → authorize → select `lumloop` repo
4. DigitalOcean will auto-detect Node.js
5. Set these settings:
   - **Build command:** `npm run build`
   - **Run command:** `node dist/index.cjs`
   - **HTTP port:** 5000
   - **Instance size:** Basic ($5/mo) for start
6. Add environment variable:
   - `NODE_ENV` = `production`
7. Click "Create Resources"

### Option B: Via CLI
```bash
# Install doctl
brew install doctl  # or snap install doctl

# Authenticate
doctl auth init

# Create app from spec
doctl apps create --spec .do/app.yaml
```

## Step 3: Connect lumloop.com Domain

1. In DigitalOcean App dashboard → Settings → Domains
2. Add `lumloop.com`
3. Add `www.lumloop.com`
4. DigitalOcean gives you a CNAME target (e.g., `xxxx.ondigitalocean.app`)
5. In your domain registrar DNS settings:
   - Add CNAME: `www` → `xxxx.ondigitalocean.app`
   - Add A record: `@` → DigitalOcean's provided IP
   - Or use ALIAS/ANAME if your registrar supports it
6. SSL is automatic (Let's Encrypt)

## Step 4: Add PostgreSQL (when ready for persistent data)

1. In DigitalOcean → Databases → Create → PostgreSQL
2. Choose Singapore region (closest to your target market)
3. Dev database: $7/mo
4. Copy the connection string
5. Add as env var: `DATABASE_URL` = your connection string
6. Update the storage layer from MemStorage to Drizzle + PostgreSQL

---

## Current Architecture

```
lumloop-mvp/
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── App.tsx      # Main app with user context + routing
│   │   ├── pages/       # 10 screens (all functional)
│   │   ├── components/  # Shared components (logo, score ring, shell)
│   │   └── lib/         # Query client, utilities
│   └── index.html
├── server/
│   ├── index.ts         # Express server entry
│   ├── routes.ts        # API routes (13 endpoints)
│   ├── storage.ts       # Data layer (MemStorage → swap to PG)
│   └── vite.ts          # Vite dev middleware
├── shared/
│   └── schema.ts        # Database schema (Drizzle ORM)
├── Dockerfile           # Container build
├── .do/app.yaml         # DigitalOcean App Platform spec
└── package.json
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create user + seed data |
| GET | /api/user/:id | Get user profile |
| PATCH | /api/user/:id | Update user |
| GET | /api/assessment/:userId | Get assessment |
| POST | /api/assessment | Submit assessment |
| GET | /api/scores/:userId | Get daily scores (30 days) |
| GET | /api/scores/:userId/today | Get today's score |
| GET | /api/supplements/:userId | Get active supplements |
| POST | /api/supplements | Add supplement |
| GET | /api/supplement-logs/:userId/:date | Get daily logs |
| PATCH | /api/supplement-logs/:id | Toggle taken/not taken |
| GET | /api/meals/:userId/:date | Get daily meals |
| PATCH | /api/meals/:id | Update meal (mark logged) |
| GET | /api/goals/:userId | Get wellness goals |
| PATCH | /api/goals/:id | Update goal progress |

## What's Functional

- User registration with name + email
- 5-question AI health assessment (saves to DB)
- Dashboard with real bio age, readiness, organ ages, HRV, sleep, energy, focus
- Interactive supplement toggle (marks taken/not taken via API)
- 7 days of historical score data (seeded)
- 6 supplements with confidence scores
- 4 daily meals with macro data and AI rationale
- 5 wellness goals with progress tracking
- All 10 screens navigable via bottom tab bar
- GLP-1 companion mode banner
- Premium dark-mode UI matching the visual concept

## What Needs Adding for Production

1. **PostgreSQL** — swap MemStorage for Drizzle + PG
2. **Authentication** — add proper JWT or session auth
3. **Apple Health integration** — HealthKit API via native bridge
4. **Stripe** — subscription billing for tiers
5. **Supplement ordering** — Shopify or custom e-commerce
6. **Email** — transactional emails (SendGrid/Resend)
7. **Analytics** — PostHog or Mixpanel
8. **Error tracking** — Sentry

## Development

```bash
npm install
npm run dev    # starts on port 5000
```
