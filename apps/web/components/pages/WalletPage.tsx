'use client';
import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { formatNZM, nzmToUsd, calculateWithdrawal, TOKEN_CONSTANTS } from '@/lib/tokenomics';

const MOCK_TRANSACTIONS = [
  { id: '1', type: 'stream_earn',   desc: 'Stream earnings',     sub: '51 tracks · Today',                   amount: 12.75,  positive: true,  icon: '🎵' },
  { id: '2', type: 'referral',      desc: 'Referral bonus',      sub: 'Friend joined NzemFi',                amount: 50,     positive: true,  icon: '👥' },
  { id: '3', type: 'withdrawal',    desc: 'Withdrawal request',  sub: 'Pending · To BSC ...3e3e',            amount: -100,   positive: false, icon: '↑' },
  { id: '4', type: 'stream_earn',   desc: 'Stream earnings',     sub: '48 tracks · Yesterday',               amount: 12,     positive: true,  icon: '🎵' },
  { id: '5', type: 'premium_bonus', desc: 'Premium welcome bonus', sub: 'Upgraded to Premium',               amount: 25,     positive: true,  icon: '⭐' },
  { id: '6', type: 'artist_royalty',desc: 'Artist royalty',      sub: 'Your track streamed',                 amount: 3.5,    positive: true,  icon: '🎤' },
  { id: '7', type: 'stream_earn',   desc: 'Stream earnings',     sub: '44 tracks · 2 days ago',              amount: 11,     positive: true,  icon: '🎵' },
];

export default function WalletPage() {
  const { user } = useAuthStore();
  const balance = user?.nzm_balance ?? 1247.5;
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletAddr, setWalletAddr] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const wd = withdrawAmount ? calculateWithdrawal(Number(withdrawAmount)) : null;

  const handleWithdrawSubmit = () => {
    // In Phase 1 this calls /api/wallet/withdraw which queues the request
    setSubmitted(true);
  };

  return (
    <div style={{ padding: '28px 24px' }}>

      {/* Phase 1 info banner */}
      <div style={{
        background: 'rgba(59,130,246,0.08)',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: 14,
        padding: '14px 18px',
        marginBottom: 22,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>ℹ️</span>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#60a5fa', marginBottom: 4 }}>
            Phase 1 — In-App Balances
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Your NZM tokens are held as in-app credits right now. Every stream you earn is recorded and
            fully yours. When NzemFi launches its token on BNB Smart Chain, your balance will be
            migrated to your wallet <strong style={{ color: 'var(--text-primary)' }}>1:1 with no loss</strong>.
            Withdrawal requests are processed manually within 48 hours during this phase.
          </div>
        </div>
      </div>

      {/* Balance Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.28), rgba(249,115,22,0.12))',
        border: '1px solid var(--border-default)',
        borderRadius: 20,
        padding: '32px 28px',
        marginBottom: 24,
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>
          NZM In-App Balance
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 800, color: 'var(--nzm-gold)', lineHeight: 1 }}>
          {balance.toFixed(2)}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
          ≈ {nzmToUsd(balance)} · Indicative value
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap' }}>
          {[
            { label: 'Request Withdrawal', icon: '↑', action: () => setShowWithdraw(true) },
            { label: 'Transaction History', icon: '📋', action: () => {} },
          ].map(b => (
            <button key={b.label} onClick={b.action} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-subtle)',
              padding: '10px 18px', borderRadius: 24,
              fontSize: 13, color: 'var(--text-primary)',
              cursor: 'pointer', transition: 'var(--transition)',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
            >
              <span style={{ fontSize: 16 }}>{b.icon}</span> {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Earned Today',   value: '12.75',    sub: '51 streams',          color: 'var(--nzm-gold)' },
          { label: 'This Month',     value: '342.00',   sub: '1,368 streams',       color: 'var(--nzm-gold)' },
          { label: 'Total Earned',   value: '1,247.50', sub: 'All time',            color: 'var(--nzm-purple-lighter)' },
          { label: 'Earn Rate',
            value: user?.is_premium ? '0.50' : '0.25',
            sub: user?.is_premium ? 'Premium · 2× rate' : 'Free tier',
            color: user?.is_premium ? 'var(--nzm-gold)' : 'var(--text-secondary)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Premium upsell */}
      {!user?.is_premium && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(240,192,64,0.1), rgba(249,115,22,0.08))',
          border: '1px solid rgba(240,192,64,0.25)',
          borderRadius: 14, padding: '18px 22px', marginBottom: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
        }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>⭐ Upgrade to Premium — Earn 2×</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Earn 0.50 NZM per stream instead of 0.25. Plus ad-free, HD audio, offline downloads. Just $1/month.
            </div>
          </div>
          <button className="btn-primary" style={{
            whiteSpace: 'nowrap', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--nzm-gold-dark), var(--nzm-orange))',
          }}>
            Upgrade $1/mo
          </button>
        </div>
      )}

      {/* Transaction History */}
      <div className="section-header">
        <span className="section-title">Transaction History</span>
      </div>
      <div className="card" style={{ padding: '4px 0' }}>
        {MOCK_TRANSACTIONS.map((tx, i) => (
          <div key={tx.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '13px 18px',
            borderBottom: i < MOCK_TRANSACTIONS.length - 1 ? '1px solid var(--border-subtle)' : 'none',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: tx.positive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 17, flexShrink: 0,
            }}>{tx.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{tx.desc}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{tx.sub}</div>
            </div>
            {/* Show PENDING badge for withdrawal requests in Phase 1 */}
            {tx.type === 'withdrawal' && (
              <span className="badge badge-purple" style={{ fontSize: 10, marginRight: 6 }}>PENDING</span>
            )}
            <div style={{ fontSize: 14, fontWeight: 600, color: tx.positive ? 'var(--success)' : '#ef4444' }}>
              {tx.positive ? '+' : ''}{tx.amount.toFixed(2)} NZM
            </div>
          </div>
        ))}
      </div>

      {/* Withdrawal Modal */}
      {showWithdraw && (
        <div className="modal-overlay" onClick={() => { setShowWithdraw(false); setSubmitted(false); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 8 }}>
                  Withdrawal Requested
                </h2>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 22 }}>
                  Your withdrawal request has been submitted. Your in-app balance has been debited.
                  The NzemFi team will send <strong style={{ color: 'var(--nzm-gold)' }}>{wd?.net.toFixed(2)} NZM</strong> to
                  your BSC wallet within <strong>48 hours</strong>.
                </p>
                <button className="btn-primary" onClick={() => { setShowWithdraw(false); setSubmitted(false); }} style={{ width: '100%', justifyContent: 'center' }}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginBottom: 6 }}>
                  Request Withdrawal
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                  During Phase 1, withdrawals are processed manually by the NzemFi team within 48 hours and sent to your BNB Smart Chain (BEP-20) wallet.
                  Minimum {TOKEN_CONSTANTS.MIN_WITHDRAWAL_NZM} NZM. 5% fee applies.
                </p>

                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label">Amount (NZM)</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder={`Min ${TOKEN_CONSTANTS.MIN_WITHDRAWAL_NZM} NZM`}
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label">Your BSC Wallet Address (BEP-20)</label>
                  <input
                    className="form-input"
                    placeholder="0x..."
                    value={walletAddr}
                    onChange={e => setWalletAddr(e.target.value)}
                  />
                </div>

                {wd && (
                  <div style={{ background: 'var(--bg-tertiary)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
                    {[
                      { label: 'Amount', val: `${wd.gross.toFixed(4)} NZM` },
                      { label: 'Platform fee (5%)', val: `-${wd.fee.toFixed(4)} NZM`, red: true },
                    ].map(r => (
                      <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                        <span style={{ color: r.red ? '#ef4444' : 'var(--text-primary)' }}>{r.val}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600 }}>
                      <span>You receive</span>
                      <span style={{ color: 'var(--nzm-gold)' }}>{wd.net.toFixed(4)} NZM</span>
                    </div>
                  </div>
                )}

                <button
                  className="btn-primary"
                  disabled={!wd?.meetsMinimum || !walletAddr}
                  onClick={handleWithdrawSubmit}
                  style={{
                    width: '100%', justifyContent: 'center', padding: 13,
                    opacity: (!wd?.meetsMinimum || !walletAddr) ? 0.5 : 1,
                  }}
                >
                  Submit Withdrawal Request
                </button>
                <button
                  onClick={() => setShowWithdraw(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', marginTop: 12, width: '100%' }}
                >
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={() => { setShowWithdraw(false); setSubmitted(false); }}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer' }}
            >×</button>
          </div>
        </div>
      )}
    </div>
  );
}
