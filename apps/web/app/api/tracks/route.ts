import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const genre = searchParams.get('genre');
    const artist_id = searchParams.get('artist_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createAdminClient();

    let query = supabase
      .from('tracks')
      .select('*')
      .eq('is_published', true)
      .eq('copyright_status', 'cleared')
      .order('stream_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) query = query.ilike('title', `%${q}%`);
    if (genre) query = query.eq('genre', genre);
    if (artist_id) query = query.eq('artist_id', artist_id);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ tracks: data || [] });
  } catch (err: any) {
    console.error('Tracks GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  }
}