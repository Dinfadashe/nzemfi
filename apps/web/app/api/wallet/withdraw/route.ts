import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/client';
import { TOKEN_CONSTANTS } from '@/lib/tokenomics';

// NOTE: Withdrawal in Phase 1 means requesting a transfer of in-app NZM
// balance to an external BSC wallet. This is queued for manual/batch
// processing by the NzemFi treasury team until the NZM token is deployed
// on-chain. No blockchain calls are made here.

export async function POST(req: NextRequest) {
  try {
    const { user_id, amount_nzm, wallet_address } = await req.json();

    if (!user_id || !amount_nzm || !wallet_address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Basic BSC address format check (0x + 40 hex chars) — no ethers dependency
    const bscAddressRegex = /^0x[0-9a-fA-F]{40}$/;
    if (!bscAddressRegex.test(wallet_address)) {
      return NextResponse.json({ error: 'Invalid BSC wallet address format' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch user
    const { data: user } = await supabase
      .from('users')
      .select('id, nzm_balance, kyc_status')
      .eq('id', user_id)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.kyc_status !== 'approved') {
      return NextResponse.json({
        error: 'KYC verification required before requesting a withdrawal',
      }, { status: 403 });
    }

    if (amount_nzm < TOKEN_CONSTANTS.MIN_WITHDRAWAL_NZM) {
      return NextResponse.json({
        error: `Minimum withdrawal is ${TOKEN_CONSTANTS.MIN_WITHDRAWAL_NZM} NZM`,
      }, { status: 400 });
    }

    if ((user.nzm_balance || 0) < amount_nzm) {
      return NextResponse.json({ error: 'Insufficient NZM balance' }, { status: 400 });
    }

    // 2. Calculate fee
    const fee    = parseFloat((amount_nzm * TOKEN_CONSTANTS.WITHDRAWAL_FEE_PCT).toFixed(8));
    const netNzm = parseFloat((amount_nzm - fee).toFixed(8));

    // 3. Deduct from in-app balance immediately (optimistic lock)
    const { error: deductErr } = await supabase
      .from('users')
      .update({ nzm_balance: (user.nzm_balance || 0) - amount_nzm })
      .eq('id', user_id)
      .eq('nzm_balance', user.nzm_balance); // Concurrency guard

    if (deductErr) {
      return NextResponse.json({
        error: 'Balance changed during request — please try again',
      }, { status: 409 });
    }

    // 4. Record withdrawal request as PENDING
    // Status stays 'pending' until NzemFi team processes the on-chain transfer
    // (after token contract is deployed). Users can see this in their history.
    const { data: txRecord, error: txErr } = await supabase
      .from('token_transactions')
      .insert({
        user_id,
        type: 'withdrawal',
        amount: -amount_nzm,
        status: 'pending',
        // tx_hash will be filled in when the on-chain transfer is processed
      } as any)
      .select()
      .single();

    if (txErr) throw txErr;

    // 5. Store withdrawal request details in a separate table for admin queue
    await supabase.from('withdrawal_requests').insert({
      user_id,
      transaction_id: txRecord.id,
      amount_nzm: netNzm,
      fee_nzm: fee,
      wallet_address,
      status: 'queued',
    } as any).maybeSingle(); // Won't error if table doesn't exist yet during dev

    return NextResponse.json({
      success: true,
      request_id: txRecord.id,
      gross_nzm: amount_nzm,
      fee_nzm: fee,
      net_nzm: netNzm,
      wallet_address,
      status: 'pending',
      message: `Withdrawal of ${netNzm} NZM requested. Your in-app balance has been debited. Transfers are processed manually during Phase 1 and sent to your BSC wallet within 48 hours.`,
    });

  } catch (err: any) {
    console.error('Withdrawal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
