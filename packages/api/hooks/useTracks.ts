import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch trending tracks (top by stream count)
 */
export async function fetchTrendingTracks(limit = 20) {
  const { data, error } = await supabase
    .from('tracks')
    .select('*, users!tracks_artist_id_fkey(id, username, full_name, avatar_url)')
    .eq('is_published', true)
    .eq('copyright_status', 'cleared')
    .order('stream_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Fetch tracks by genre
 */
export async function fetchTracksByGenre(genre: string, limit = 20) {
  const { data, error } = await supabase
    .from('tracks')
    .select('*, users!tracks_artist_id_fkey(id, username, full_name, avatar_url)')
    .eq('is_published', true)
    .eq('copyright_status', 'cleared')
    .eq('genre', genre)
    .order('stream_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Fetch tracks for a specific artist
 */
export async function fetchArtistTracks(artistId: string) {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('artist_id', artistId)
    .eq('is_published', true)
    .order('stream_count', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Search tracks and artists
 */
export async function searchContent(query: string) {
  const [tracks, artists] = await Promise.all([
    supabase
      .from('tracks')
      .select('*, users!tracks_artist_id_fkey(id, username, full_name)')
      .eq('is_published', true)
      .eq('copyright_status', 'cleared')
      .ilike('title', `%${query}%`)
      .limit(10),
    supabase
      .from('users')
      .select('id, username, full_name, avatar_url, is_verified_artist, is_artist')
      .eq('is_artist', true)
      .ilike('full_name', `%${query}%`)
      .limit(5),
  ]);

  return {
    tracks: tracks.data || [],
    artists: artists.data || [],
  };
}

/**
 * Record a stream event and earn NZM
 */
export async function recordStream(params: {
  userId: string;
  trackId: string;
  listenedSeconds: number;
  deviceType: 'web' | 'ios' | 'android';
}) {
  const endpoint = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/streams/record`
    : '/api/streams/record';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to record stream');
  }

  return res.json();
}

/**
 * Like or unlike a track
 */
export async function toggleLike(userId: string, trackId: string) {
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('track_id', trackId)
    .maybeSingle();

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id);
    await supabase.rpc('increment_like_count', { track_id: trackId, delta: -1 });
    return { liked: false };
  } else {
    await supabase.from('likes').insert({ user_id: userId, track_id: trackId } as any);
    await supabase.rpc('increment_like_count', { track_id: trackId, delta: 1 });
    return { liked: true };
  }
}

/**
 * Follow or unfollow an artist
 */
export async function toggleFollow(followerId: string, followingId: string) {
  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  if (existing) {
    await supabase.from('follows').delete().eq('id', existing.id);
    return { following: false };
  } else {
    await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId } as any);
    return { following: true };
  }
}

/**
 * Fetch user's liked track IDs
 */
export async function fetchLikedTrackIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('likes')
    .select('track_id')
    .eq('user_id', userId);

  return (data || []).map((l: any) => l.track_id);
}

/**
 * Fetch user's listening history
 */
export async function fetchListeningHistory(userId: string, limit = 30) {
  const { data, error } = await supabase
    .from('listening_history')
    .select('*, tracks(*, users!tracks_artist_id_fkey(id, username, full_name))')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Fetch user token transaction history
 */
export async function fetchTransactions(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('token_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Fetch current halving rate from DB
 */
export async function fetchCurrentHalvingRates(): Promise<{ freeRate: number; premiumRate: number; halvingCount: number }> {
  const { data } = await supabase
    .from('halving_schedule')
    .select('free_rate, premium_rate, halving_count')
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  return {
    freeRate: data?.free_rate ?? 0.25,
    premiumRate: data?.premium_rate ?? 0.50,
    halvingCount: data?.halving_count ?? 0,
  };
}
