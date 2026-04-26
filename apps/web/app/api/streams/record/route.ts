import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { user_id, track_id, listened_seconds, device_type } = await req.json();

    if (!user_id || !track_id || !listened_seconds) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: user } = await supabase
      .from('users')
      .select('id, is_premium, nzm_balance, total_streams')
      .eq('id', user_id)
      .single() as { data: any };

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { data: track } = await supabase
      .from('tracks')
      .select('id, artist_id, duration_seconds, is_published')
      .eq('id', track_id)
      .single() as { data: any };

    if (!track || !track.is_published) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Anti-fraud: max 50 earning streams per day
    const today = new Date().toISOString().split('T')[0];
    const { count: dailyCount } = await supabase
      .from('streams')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('is_full_play', true)
      .gte('streamed_at', `${today}T00:00:00Z`);

    if ((dailyCount ?? 0) >= 50) {
      return NextResponse.json({ nzm_earned: 0, reason: 'daily_cap_reached' });
    }

    // Get current halving rate
    const { data: halvingData } = await supabase
      .from('halving_schedule')
      .select('free_rate, premium_rate, halving_count')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single() as { data: any };

    const currentFreeRate    = halvingData?.free_rate    ?? 0.25;
    const currentPremiumRate = halvingData?.premium_rate ?? 0.50;

    const tier       = user.is_premium ? 'premium' : 'free';
    const baseRate   = tier === 'premium' ? currentPremiumRate : currentFreeRate;
    const qualifies  = listened_seconds >= 30;
    const isFullPlay = listened_seconds >= track.duration_seconds * 0.8;

    const fanEarning    = qualifies ? parseFloat((baseRate * 0.7).toFixed(8)) : 0;
    const artistEarning = qualifies ? parseFloat((baseRate * 0.3).toFixed(8)) : 0;

    // Record stream
    await (supabase.from('streams') as any).insert({
      user_id,
      track_id,
      listened_seconds,
      is_full_play: isFullPlay,
      nzm_earned: fanEarning,
      artist_nzm_earned: artistEarning,
      user_tier: tier,
      halving_factor: halvingData?.halving_count ?? 0,
      device_type: device_type || 'web',
      ip_address: req.headers.get('x-forwarded-for') || null,
    });

    if (qualifies) {
      // Credit fan
      await (supabase.from('users') as any).update({
        nzm_balance: (user.nzm_balance || 0) + fanEarning,
        total_streams: (user.total_streams || 0) + 1,
      }).eq('id', user_id);

      await (supabase.from('token_transactions') as any).insert({
        user_id,
        type: 'stream_earn',
        amount: fanEarning,
        reference_id: track_id,
        status: 'confirmed',
      });

      // Credit artist
      const { data: artistUser } = await supabase
        .from('users')
        .select('nzm_balance')
        .eq('id', track.artist_id)
        .single() as { data: any };

      if (artistUser) {
        await (supabase.from('users') as any).update({
          nzm_balance: (artistUser.nzm_balance || 0) + artistEarning,
        }).eq('id', track.artist_id);

        await (supabase.from('token_transactions') as any).insert({
          user_id: track.artist_id,
          type: 'artist_royalty',
          amount: artistEarning,
          reference_id: track_id,
          status: 'confirmed',
        });
      }

      await supabase.rpc('increment_stream_count', { track_id });
    }

    await (supabase.from('listening_history') as any).insert({
      user_id,
      track_id,
      played_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      qualifies,
      nzm_earned: fanEarning,
      artist_nzm_earned: artistEarning,
      new_balance: (user.nzm_balance || 0) + fanEarning,
    });

  } catch (err: any) {
    console.error('Stream record error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}