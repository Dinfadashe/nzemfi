import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/client';
import crypto from 'crypto';

async function scanWithACRCloud(audioUrl: string): Promise<{
  matched: boolean;
  confidence: number;
  title?: string;
  artist?: string;
  label?: string;
}> {
  const host = process.env.ACRCLOUD_HOST!;
  const accessKey = process.env.ACRCLOUD_ACCESS_KEY!;
  const accessSecret = process.env.ACRCLOUD_ACCESS_SECRET!;

  if (!host || !accessKey || !accessSecret) {
    return { matched: false, confidence: 0 };
  }

  const httpMethod = 'POST';
  const httpUri = '/v1/identify';
  const dataType = 'audio';
  const signatureVersion = '1';
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const stringToSign = [httpMethod, httpUri, accessKey, dataType, signatureVersion, timestamp].join('\n');
  const signature = crypto.createHmac('sha1', accessSecret).update(stringToSign).digest('base64');

  const audioResp = await fetch(audioUrl);
  if (!audioResp.ok) throw new Error('Failed to fetch audio for scanning');
  const audioBuffer = await audioResp.arrayBuffer();

  const formData = new FormData();
  formData.append('access_key', accessKey);
  formData.append('sample_bytes', audioBuffer.byteLength.toString());
  formData.append('sample', new Blob([audioBuffer], { type: 'audio/mpeg' }), 'sample.mp3');
  formData.append('data_type', dataType);
  formData.append('signature_version', signatureVersion);
  formData.append('signature', signature);
  formData.append('timestamp', timestamp);

  const resp = await fetch(`https://${host}${httpUri}`, { method: 'POST', body: formData });
  const result = await resp.json();

  if (result.status?.code === 0 && result.metadata?.music?.length > 0) {
    const match = result.metadata.music[0];
    return {
      matched: true,
      confidence: match.score || 100,
      title: match.title,
      artist: match.artists?.[0]?.name,
      label: match.label,
    };
  }

  return { matched: false, confidence: 0 };
}

export async function POST(req: NextRequest) {
  try {
    const { track_id, audio_url, user_id } = await req.json();

    if (!track_id || !audio_url || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify track ownership
    const { data: track } = await supabase
      .from('tracks')
      .select('id, artist_id, title')
      .eq('id', track_id)
      .eq('artist_id', user_id)
      .single();

    if (!track) {
      return NextResponse.json({ error: 'Track not found or unauthorized' }, { status: 403 });
    }

    // Run ACRCloud scan
    let scanResult;
    try {
      scanResult = await scanWithACRCloud(audio_url);
    } catch {
      await (supabase.from('tracks') as any)
        .update({ copyright_status: 'pending' })
        .eq('id', track_id);

      return NextResponse.json({ status: 'pending_review', message: 'Copyright scan queued for manual review.' });
    }

    if (scanResult.matched && scanResult.confidence >= 85) {
      await (supabase.from('tracks') as any)
        .update({
          copyright_status: 'rejected',
          copyright_fingerprint: `acrcloud_match:${scanResult.title}_${scanResult.artist}`,
        })
        .eq('id', track_id);

      return NextResponse.json({
        status: 'rejected',
        matched: true,
        confidence: scanResult.confidence,
        matched_title: scanResult.title,
        matched_artist: scanResult.artist,
        message: `Copyright match detected. Upload rejected.`,
      });
    }

    const fingerprint = `acrcloud_clear:${Date.now()}`;
    await (supabase.from('tracks') as any)
      .update({ copyright_status: 'cleared', copyright_fingerprint: fingerprint })
      .eq('id', track_id);

    return NextResponse.json({
      status: 'cleared',
      matched: false,
      fingerprint,
      message: 'No copyright matches found. Track cleared for publication.',
    });
  } catch (err: any) {
    console.error('Copyright scan error:', err);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}