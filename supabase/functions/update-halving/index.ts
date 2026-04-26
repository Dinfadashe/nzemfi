// supabase/functions/update-halving/index.ts
// Scheduled daily via Supabase cron (pg_cron) or external scheduler
// Counts active users (streamed in last 30 days) and updates halving rate

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BASE_RATE_FREE = 0.25;
const BASE_RATE_PREMIUM = 0.50;
const BASE_USERS = 100;
const HALVING_MULTIPLIER = 100;

function computeHalvingFactor(activeUsers: number): { halvings: number; factor: number } {
  if (activeUsers < BASE_USERS) return { halvings: 0, factor: 1 };
  const halvings = Math.floor(Math.log(activeUsers / BASE_USERS) / Math.log(HALVING_MULTIPLIER));
  return { halvings, factor: Math.pow(0.5, halvings) };
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Count users active in last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { count: activeUsers } = await supabase
    .from('streams')
    .select('user_id', { count: 'exact', head: true })
    .gte('streamed_at', thirtyDaysAgo);

  const total = activeUsers ?? 0;
  const { halvings, factor } = computeHalvingFactor(total);
  const freeRate = parseFloat((BASE_RATE_FREE * factor).toFixed(8));
  const premiumRate = parseFloat((BASE_RATE_PREMIUM * factor).toFixed(8));

  // Insert new halving record
  const { error } = await supabase.from('halving_schedule').insert({
    active_users: total,
    halving_count: halvings,
    free_rate: freeRate,
    premium_rate: premiumRate,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  console.log(`Halving updated: ${total} active users, ${halvings} halvings, free=${freeRate} NZM`);

  return new Response(JSON.stringify({
    active_users: total,
    halving_count: halvings,
    free_rate: freeRate,
    premium_rate: premiumRate,
  }), { headers: { 'Content-Type': 'application/json' } });
});
