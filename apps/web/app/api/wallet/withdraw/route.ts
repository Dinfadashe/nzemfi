import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/client';
import { TOKEN_CONSTANTS } from '@/lib/tokenomics';

export async function POST(req: NextRequest) {
  try {
    const { user_id, amount_nzm, wallet_address } = await req.json();

    if (!user_id || !amount_nzm || !wallet_address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const bscAddressRegex = /^0x[0-9a-fA-F]{40}$/;
    if (!bscAddressRegex.test(wallet_address)) {
      return NextResponse.json({ error: 'Invalid BSC wallet address' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: user } = await supabase
      .from('users')
      .select('id, nzm_balance, kyc_status')
      .eq('id', user_id)
      .single() as { data: any };

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (user.kyc_status !== 'approved') {
      return NextResponse.json({ error: 'KYC verification required' }, { status: 403 });
    }

    if (amount_nzm < TOKEN_CONSTANTS.MIN_WITHDRAWAL_NZM) {
      return NextResponse.json({ error: `Minimum withdrawal is ${TOKEN_CONSTANTS.MIN_WITHDRAWAL_NZM} NZM` }, { status: 400 });
    }

    if ((user.nzm_balance || 0) < amount_nzm) {
      return NextResponse.json({ error: 'Insufficient NZM balance' }, { status: 400 });
    }

    const fee    = parseFloat((amount_nzm * TOKEN_CONSTANTS.WITHDRAWAL_FEE_PCT).toFixed(8));
    const netNzm = parseFloat((amount_nzm - fee).toFixed(8));

    await (supabase.from('users') as any).update({
      nzm_balance: (user.nzm_balance || 0) - amount_nzm,
    }).eq('id', user_id);

    const { data: txRecord } = await (supabase.from('token_transactions') as any).insert({
      user_id,
      type: 'withdrawal',
      amount: -amount_nzm,
      status: 'pending',
    }).select().single();

    await (supabase.from('withdrawal_requests') as any).insert({
      user_id,
      transaction_id: txRecord?.id,
      amount_nzm: netNzm,
      fee_nzm: fee,
      wallet_address,
      status: 'queued',
    });

    return NextResponse.json({
      success: true,
      request_id: txRecord?.id,
      gross_nzm: amount_nzm,
      fee_nzm: fee,
      net_nzm: netNzm,
      wallet_address,
      status: 'pending',
      message: `Withdrawal of ${netNzm} NZM requested. Will be processed within 48 hours.`,
    });

  } catch (err: any) {
    console.error('Withdrawal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}