// NZM Token Economics — NzemFi Platform
// Phase 1: All balances are in-app (Supabase database).
// Phase 2 (post-adoption): NZM token deployed on BNB Smart Chain,
//   in-app balances migrated to on-chain wallets 1:1.

export const TOKEN_CONSTANTS = {
  BASE_FREE_RATE:     0.25,   // NZM per qualifying stream (free tier)
  BASE_PREMIUM_RATE:  0.50,   // NZM per qualifying stream (premium tier)
  ARTIST_SHARE_PCT:   0.30,   // 30% of stream earning goes to artist
  FAN_SHARE_PCT:      0.70,   // 70% retained by fan
  MIN_LISTEN_SECONDS: 30,     // Minimum seconds to qualify for earning
  FULL_PLAY_THRESHOLD: 0.80,  // 80% of duration = full play
  MAX_DAILY_EARNING_STREAMS: 50, // Anti-bot: earning cap per day
  MIN_WITHDRAWAL_NZM: 100,    // Minimum NZM to request a withdrawal
  WITHDRAWAL_FEE_PCT: 0.05,   // 5% fee on withdrawal requests
  HALVING_BASE_USERS: 100,    // Halving milestone base
  HALVING_MULTIPLIER: 100,    // Each milestone = 100× the previous
  TOKEN_USD_RATE:     0.01,   // Display rate: 1 NZM = $0.01 (indicative)
  TOKEN_SYMBOL:       'NZM',
  PHASE:              1,      // 1 = in-app only, 2 = on-chain
} as const;

/**
 * Halving factor based on active user count.
 * Users 100–9,999        → 0 halvings → factor 1.0     → 0.25 NZM/stream
 * Users 10,000–999,999   → 1st halving → factor 0.5    → 0.125 NZM/stream
 * Users 1M–99.9M         → 2nd halving → factor 0.25   → 0.0625 NZM/stream
 * Users 100M+            → 3rd halving → factor 0.125  → 0.03125 NZM/stream
 */
export function getHalvingFactor(activeUsers: number): number {
  if (activeUsers < TOKEN_CONSTANTS.HALVING_BASE_USERS) return 1;
  const halvings = Math.floor(
    Math.log(activeUsers / TOKEN_CONSTANTS.HALVING_BASE_USERS) /
    Math.log(TOKEN_CONSTANTS.HALVING_MULTIPLIER)
  );
  return Math.pow(0.5, halvings);
}

/** Current NZM earn rate for a given tier and active user count. */
export function getStreamRate(tier: 'free' | 'premium', activeUsers: number): number {
  const base = tier === 'premium'
    ? TOKEN_CONSTANTS.BASE_PREMIUM_RATE
    : TOKEN_CONSTANTS.BASE_FREE_RATE;
  return parseFloat((base * getHalvingFactor(activeUsers)).toFixed(8));
}

/**
 * Calculate fan and artist earnings for a stream.
 * All amounts are in-app NZM credits (Phase 1).
 */
export function calculateStreamEarning(
  tier: 'free' | 'premium',
  activeUsers: number,
  listenedSeconds: number,
  durationSeconds: number
): { fanEarning: number; artistEarning: number; qualifies: boolean } {
  const qualifies = listenedSeconds >= TOKEN_CONSTANTS.MIN_LISTEN_SECONDS;
  if (!qualifies) return { fanEarning: 0, artistEarning: 0, qualifies: false };

  const totalRate     = getStreamRate(tier, activeUsers);
  const fanEarning    = parseFloat((totalRate * TOKEN_CONSTANTS.FAN_SHARE_PCT).toFixed(8));
  const artistEarning = parseFloat((totalRate * TOKEN_CONSTANTS.ARTIST_SHARE_PCT).toFixed(8));

  return { fanEarning, artistEarning, qualifies: true };
}

/** Format NZM balance for display */
export function formatNZM(amount: number, decimals = 2): string {
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })} ${TOKEN_CONSTANTS.TOKEN_SYMBOL}`;
}

/** Indicative USD value display */
export function nzmToUsd(amount: number): string {
  return `$${(amount * TOKEN_CONSTANTS.TOKEN_USD_RATE).toFixed(2)}`;
}

/** Withdrawal calculation (Phase 1 = queued manual transfer) */
export function calculateWithdrawal(grossNzm: number): {
  gross: number;
  fee: number;
  net: number;
  meetsMinimum: boolean;
} {
  const fee = parseFloat((grossNzm * TOKEN_CONSTANTS.WITHDRAWAL_FEE_PCT).toFixed(8));
  const net = parseFloat((grossNzm - fee).toFixed(8));
  return {
    gross: grossNzm,
    fee,
    net,
    meetsMinimum: grossNzm >= TOKEN_CONSTANTS.MIN_WITHDRAWAL_NZM,
  };
}

/** Format seconds as MM:SS */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Format large stream counts */
export function formatCount(count: number): string {
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
  if (count >= 1_000_000)     return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000)         return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

/** Halving schedule for display on Tokenomics page */
export function getHalvingSchedule() {
  return [
    { users: '100 — 9,999',       halvings: 0, freeRate: 0.25,    premiumRate: 0.50 },
    { users: '10,000 — 999,999',  halvings: 1, freeRate: 0.125,   premiumRate: 0.25 },
    { users: '1M — 99.9M',        halvings: 2, freeRate: 0.0625,  premiumRate: 0.125 },
    { users: '100M+',             halvings: 3, freeRate: 0.03125, premiumRate: 0.0625 },
  ];
}
