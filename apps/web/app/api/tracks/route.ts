import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const genre = searchParams.get('genre');
    const artist_id = searchParams.get('artist_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = await createServerComponentClient();

    let query = supabase
      .from('tracks')
      .select(`
        id, title, genre, audio_url, cover_url, duration_seconds,
        audio_quality, stream_count, like_count, release_date, is_exclusive,
        artist_id,
        users!tracks_artist_id_fkey(id, username, full_name, avatar_url, is_verified_artist)
      `)
      .eq('is_published', true)
      .eq('copyright_status', 'cleared')
      .order('stream_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) {
      query = query.or(`title.ilike.%${q}%`);
    }
    if (genre) {
      query = query.eq('genre', genre);
    }
    if (artist_id) {
      query = query.eq('artist_id', artist_id);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({ tracks: data || [], total: count || 0 });
  } catch (err: any) {
    console.error('Tracks GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  }
}
