import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { user_id, session_id, face_hash, liveness_score } = await req.json();

    if (!user_id || !face_hash) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check for duplicate biometric
    const { data: existing } = await supabase
      .from('users')
      .select('id, username')
      .eq('kyc_face_hash', face_hash)
      .neq('id', user_id)
      .maybeSingle();

    if (existing) {
      await (supabase.from('kyc_sessions') as any).insert({
        user_id,
        session_id: session_id || 'unknown',
        result: 'failed',
        face_hash,
      });

      await (supabase.from('users') as any).update({
        kyc_status: 'rejected',
      }).eq('id', user_id);

      return NextResponse.json(
        { success: false, reason: 'duplicate_identity', message: 'An account already exists with this biometric identity.' },
        { status: 409 }
      );
    }

    if (liveness_score !== undefined && liveness_score < 0.75) {
      return NextResponse.json(
        { success: false, reason: 'liveness_failed', message: 'Liveness check failed. Please try again.' },
        { status: 422 }
      );
    }

    await (supabase.from('kyc_sessions') as any).insert({
      user_id,
      session_id: session_id || `kyc_${Date.now()}`,
      result: 'passed',
      face_hash,
    });

    await (supabase.from('users') as any).update({
      kyc_status: 'approved',
      kyc_face_hash: face_hash,
    }).eq('id', user_id);

    return NextResponse.json({ success: true, message: 'KYC verification passed.' });
  } catch (err: any) {
    console.error('KYC verify error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}