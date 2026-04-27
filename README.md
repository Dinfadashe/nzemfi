# NzemFi — Music Finance Platform

> **Stream. Support. Earn.**

NzemFi is a tokenized music streaming platform where artists upload music for free and fans earn **NZM tokens** on every stream.

---

## 🗂 Monorepo Structure

```
nzemfi/
├── apps/
│   ├── web/          → Next.js 15 web app (PWA)
│   └── mobile/       → Expo React Native (iOS + Android)
├── packages/
│   ├── api/          → Shared Supabase client + hooks
│   └── blockchain/   → NZM smart contract (Phase 2)
└── supabase/         → Database migrations + Edge Functions
```

---

## 🪙 Token Phases

### Phase 1 — In-App (Current)
- All NZM earnings are stored as **in-app credits** in Supabase
- Every stream, royalty, and referral is logged in `token_transactions`
- Withdrawal requests are processed manually by the NzemFi team within 48 hours
- No blockchain dependency — the app works fully without a deployed contract
- Focus: **Build the user base. Earn adoption. Grow the community.**

### Phase 2 — On-Chain (Post-Adoption)
- NZM token deployed on a blockchain (TBA)
- All in-app balances migrated to on-chain wallets **1:1 with no loss**
- Withdrawals become instant and automated via smart contract
- The `packages/blockchain/` folder contains the contract, ready to deploy when the time is right

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+  ·  npm 10+  ·  Supabase account  ·  Expo CLI

### 1. Clone and install
```bash
git clone https://github.com/your-org/nzemfi.git
cd nzemfi
npm install
```

### 2. Environment Variables
Copy `apps/web/.env.example` → `apps/web/.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=...
EYERIS_API_KEY=...
ACRCLOUD_HOST=...
ACRCLOUD_ACCESS_KEY=...
ACRCLOUD_ACCESS_SECRET=...
STRIPE_SECRET_KEY=...
FLUTTERWAVE_SECRET_KEY=...
```
> Blockchain variables (`NZM_CONTRACT_ADDRESS`, `BSC_RPC_URL`, `MINTER_PRIVATE_KEY`) are **not needed** in Phase 1.

### 3. Database Setup
```bash
npm install -g supabase
supabase link --project-ref your_project_ref
supabase db push
supabase functions deploy update-halving
supabase functions deploy send-email
```

### 4. Run Locally
```bash
npm run dev:web      # → http://localhost:3000
npm run dev:mobile   # Scan QR with Expo Go
```

---

## 🪙 Token Economics

| User Type         | NZM per Stream | Notes                         |
|-------------------|---------------|-------------------------------|
| Free Listener     | 0.25 NZM      | Ad-supported                  |
| Premium Listener  | 0.50 NZM      | $1/month — 2× earnings        |
| Artist Royalty    | 30% of fan earn | Auto-credited per stream     |
| Fan Net Earning   | 70% retained  | Remainder after artist share  |

**Halving:** Rates halve every 100× active user milestone starting from 100 users.
**Minimum stream:** 30 seconds to qualify for earnings.
**Daily cap:** 50 earning streams per user per day (anti-bot).

---

## 📱 Deployment

### Web → Netlify / Vercel
```bash
cd apps/web && npm run build
netlify deploy --prod   # or: vercel --prod
```

### Android → Play Store
```bash
cd apps/mobile
eas build --platform android --profile production
eas submit --platform android
```

### iOS → App Store
```bash
cd apps/mobile
eas build --platform ios --profile production
eas submit --platform ios
```

---

## 🔐 Security
- Eyeris biometric KYC — one person, one account globally
- ACRCloud copyright fingerprinting on all uploads
- Supabase RLS — row-level data isolation
- Account lockout after failed login attempts
- No blockchain keys required until Phase 2

---

## 📄 License
Copyright © 2025 NzemFi. All rights reserved.
