// supabase/functions/send-email/index.ts
// Handles all transactional emails: verification, reset, welcome, withdrawal confirmation

import { Resend } from 'https://esm.sh/resend@4';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const FROM = Deno.env.get('RESEND_FROM_EMAIL') ?? 'info@nzemfi.com';

type EmailPayload =
  | { type: 'welcome'; to: string; name: string }
  | { type: 'verify'; to: string; name: string; verify_url: string }
  | { type: 'reset'; to: string; name: string; reset_url: string }
  | { type: 'withdrawal_confirmed'; to: string; name: string; amount: number; tx_hash: string; wallet: string }
  | { type: 'track_approved'; to: string; name: string; track_title: string }
  | { type: 'track_rejected'; to: string; name: string; track_title: string; reason: string };

function getEmailContent(payload: EmailPayload): { subject: string; html: string } {
  const base = (content: string) => `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0f;color:#f0eeff;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#7c3aed,#f97316);padding:28px;text-align:center;">
        <h1 style="margin:0;font-size:28px;font-weight:800;color:white;letter-spacing:-0.5px;">NzemFi</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Stream. Support. Earn.</p>
      </div>
      <div style="padding:32px 28px;">${content}</div>
      <div style="padding:20px 28px;border-top:1px solid rgba(124,58,237,0.2);font-size:12px;color:#6a6080;text-align:center;">
        © 2025 NzemFi · <a href="https://nzemfi.com" style="color:#a855f7;">nzemfi.com</a>
      </div>
    </div>`;

  switch (payload.type) {
    case 'welcome':
      return {
        subject: 'Welcome to NzemFi — Start Earning NZM!',
        html: base(`
          <h2 style="color:#f0c040;margin:0 0 12px;">Welcome, ${payload.name}! 🎵</h2>
          <p>Your account is ready. Start streaming and earn <strong style="color:#f0c040;">0.25 NZM tokens</strong> on every track you listen to.</p>
          <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:18px;margin:20px 0;">
            <div style="font-size:13px;color:#a89ec0;margin-bottom:8px;">Your earning rates:</div>
            <div>🎵 Free tier: <strong style="color:#f0c040;">0.25 NZM/stream</strong></div>
            <div style="margin-top:6px;">⭐ Premium tier: <strong style="color:#f0c040;">0.50 NZM/stream</strong> — $1/month</div>
          </div>
          <a href="https://nzemfi.com" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:white;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:500;margin-top:8px;">Start Listening →</a>
        `),
      };

    case 'verify':
      return {
        subject: 'Verify your NzemFi email address',
        html: base(`
          <h2 style="color:#f0eeff;margin:0 0 12px;">Confirm your email</h2>
          <p style="color:#a89ec0;">Hi ${payload.name}, please verify your email address to activate your NzemFi account.</p>
          <a href="${payload.verify_url}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:white;padding:13px 32px;border-radius:24px;text-decoration:none;font-weight:500;margin:20px 0;">Verify Email Address</a>
          <p style="color:#6a6080;font-size:12px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
        `),
      };

    case 'reset':
      return {
        subject: 'Reset your NzemFi password',
        html: base(`
          <h2 style="color:#f0eeff;margin:0 0 12px;">Password Reset</h2>
          <p style="color:#a89ec0;">Hi ${payload.name}, click below to reset your password. This link expires in 1 hour.</p>
          <a href="${payload.reset_url}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:white;padding:13px 32px;border-radius:24px;text-decoration:none;font-weight:500;margin:20px 0;">Reset Password</a>
          <p style="color:#6a6080;font-size:12px;">If you didn't request this, your account is safe. Ignore this email.</p>
        `),
      };

    case 'withdrawal_confirmed':
      return {
        subject: `NZM Withdrawal Confirmed — ${payload.amount.toFixed(2)} NZM sent`,
        html: base(`
          <h2 style="color:#f0c040;margin:0 0 12px;">✓ Withdrawal Confirmed</h2>
          <p style="color:#a89ec0;">Hi ${payload.name}, your NZM withdrawal has been processed on BNB Smart Chain.</p>
          <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.25);border-radius:12px;padding:18px;margin:20px 0;">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;"><span style="color:#a89ec0;">Amount Sent</span><strong style="color:#f0c040;">${payload.amount.toFixed(4)} NZM</strong></div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;"><span style="color:#a89ec0;">To Wallet</span><span style="font-family:monospace;font-size:12px;">${payload.wallet.slice(0,8)}...${payload.wallet.slice(-6)}</span></div>
            <div style="display:flex;justify-content:space-between;font-size:14px;"><span style="color:#a89ec0;">TX Hash</span><a href="https://bscscan.com/tx/${payload.tx_hash}" style="color:#a855f7;font-family:monospace;font-size:12px;">${payload.tx_hash.slice(0,12)}...</a></div>
          </div>
          <a href="https://bscscan.com/tx/${payload.tx_hash}" style="display:inline-block;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.4);color:#a855f7;padding:10px 22px;border-radius:24px;text-decoration:none;font-size:13px;">View on BSCScan →</a>
        `),
      };

    case 'track_approved':
      return {
        subject: `Your track "${payload.track_title}" is now live on NzemFi!`,
        html: base(`
          <h2 style="color:#22c55e;margin:0 0 12px;">✓ Track Approved & Live!</h2>
          <p style="color:#a89ec0;">Hi ${payload.name}, your track <strong style="color:#f0eeff;">"${payload.track_title}"</strong> has passed copyright review and is now live on NzemFi.</p>
          <p style="color:#a89ec0;">You will earn <strong style="color:#f0c040;">30% of every fan's NZM earnings</strong> on your track, credited automatically to your wallet after each qualifying stream.</p>
          <a href="https://nzemfi.com/analytics" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:white;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:500;margin-top:16px;">View Analytics →</a>
        `),
      };

    case 'track_rejected':
      return {
        subject: `Upload rejected: "${payload.track_title}"`,
        html: base(`
          <h2 style="color:#ef4444;margin:0 0 12px;">⚠ Track Upload Rejected</h2>
          <p style="color:#a89ec0;">Hi ${payload.name}, unfortunately your track <strong style="color:#f0eeff;">"${payload.track_title}"</strong> could not be published.</p>
          <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:16px;margin:20px 0;font-size:13px;color:#a89ec0;">
            <strong style="color:#ef4444;">Reason:</strong> ${payload.reason}
          </div>
          <p style="color:#6a6080;font-size:13px;">If you believe this is an error, please contact support@nzemfi.com with your track details.</p>
        `),
      };
  }
}

Deno.serve(async (req) => {
  try {
    const payload: EmailPayload = await req.json();
    const { subject, html } = getEmailContent(payload);

    const { error } = await resend.emails.send({
      from: `NzemFi <${FROM}>`,
      to: payload.to,
      subject,
      html,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
