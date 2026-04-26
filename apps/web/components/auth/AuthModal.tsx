'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useUIStore, useAuthStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

type AuthMode = 'login' | 'signup' | 'forgot';

const COUNTRIES = [
  'Nigeria','Ghana','Kenya','South Africa','Ethiopia','Tanzania','Uganda','Rwanda',
  'Cameroon','Senegal','Ivory Coast','Egypt','Morocco','Algeria','Tunisia',
  'United States','United Kingdom','Canada','France','Germany','Netherlands',
  'Brazil','India','Australia','Japan','Other',
];

export default function AuthModal() {
  const { closeModal } = useUIStore();
  const { setUser } = useAuthStore();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [kycStep, setKycStep] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', username: '',
    phone: '', country: '', sex: '',
  });
  const supabase = createClient();

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async () => {
    setLoading(true); setError('');
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
    if (err) { setError(err.message); setLoading(false); return; }
    const { data: user } = await supabase.from('users').select('*').eq('id', data.user!.id).single();
    if (user) setUser(user as any);
    setLoading(false); closeModal();
  };

  const handleSignup = async () => {
    setLoading(true); setError('');
    if (!form.fullName || !form.username || !form.country || !form.sex) {
      setError('Please fill in all required fields.'); setLoading(false); return;
    }
    // Proceed to KYC step first
    setKycStep(true);
    setLoading(false);
  };

  const handleKYCComplete = async () => {
    setLoading(true); setError('');
    // In production: call Eyeris SDK here, get face_hash, check uniqueness via /api/kyc/verify
    // For now: create account directly
    const { data, error: err } = await supabase.auth.signUp({ email: form.email, password: form.password });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        full_name: form.fullName,
        username: form.username.toLowerCase().replace(/\s/g, '_'),
        email: form.email,
        phone: form.phone || null,
        country: form.country,
        sex: form.sex as any,
        is_premium: false,
        is_artist: false,
        is_verified_artist: false,
        kyc_status: 'approved',
        nzm_balance: 0,
        total_streams: 0,
        failed_login_attempts: 0,
      });
      const { data: user } = await supabase.from('users').select('*').eq('id', data.user.id).single();
      if (user) setUser(user as any);
    }
    setLoading(false); closeModal();
  };

  const handleForgot = async () => {
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) { setError(err.message); setLoading(false); return; }
    setError(''); setLoading(false);
    alert('Password reset link sent to your email.');
    setMode('login');
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Image src="/logo.png" alt="NzemFi" width={56} height={56} style={{ borderRadius: 12, margin: '0 auto 10px' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, background: 'var(--nzm-gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NzemFi</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Stream. Support. Earn.</div>
        </div>

        {/* KYC Step */}
        {kycStep ? (
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6 }}>Identity Verification</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              NzemFi uses biometric KYC to ensure one account per person and protect the NZM token economy. We use Eyeris — we store only an anonymous face hash, never your image.
            </p>
            <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20, textAlign: 'center', marginBottom: 20, cursor: 'pointer' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📷</div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Enable Camera for Liveness Check</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Quick 5-second scan. Prevents duplicate accounts.</div>
            </div>
            {error && <div style={{ color: 'var(--error)', fontSize: 13, marginBottom: 14, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>{error}</div>}
            <button className="btn-primary" onClick={handleKYCComplete} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 13 }}>
              {loading ? <span className="spinner" /> : 'Complete Verification & Create Account'}
            </button>
            <button onClick={() => setKycStep(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', marginTop: 12, width: '100%' }}>
              ← Back
            </button>
          </div>
        ) : (
          <>
            {/* Mode Tabs */}
            {mode !== 'forgot' && (
              <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
                {(['login', 'signup'] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)} style={{
                    flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                    background: mode === m ? 'rgba(124,58,237,0.25)' : 'transparent',
                    color: mode === m ? 'var(--nzm-purple-lighter)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: mode === m ? 500 : 400,
                    cursor: 'pointer', transition: 'var(--transition)',
                  }}>
                    {m === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>
            )}

            {/* Forgot Password */}
            {mode === 'forgot' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginBottom: 6 }}>Reset Password</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Enter your email and we'll send a reset link.</p>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                {error && <div style={{ color: 'var(--error)', fontSize: 13, marginBottom: 14 }}>{error}</div>}
                <button className="btn-primary" onClick={handleForgot} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 12 }}>
                  {loading ? <span className="spinner" /> : 'Send Reset Link'}
                </button>
                <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', marginTop: 12, width: '100%' }}>
                  ← Back to Sign In
                </button>
              </div>
            )}

            {/* Login */}
            {mode === 'login' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => update('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
                </div>
                <button onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: 'var(--nzm-purple-lighter)', fontSize: 12, cursor: 'pointer', textAlign: 'right', padding: 0 }}>
                  Forgot password?
                </button>
                {error && <div style={{ color: 'var(--error)', fontSize: 13, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>{error}</div>}
                <button className="btn-primary" onClick={handleLogin} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 13 }}>
                  {loading ? <span className="spinner" /> : 'Sign In'}
                </button>
              </div>
            )}

            {/* Signup */}
            {mode === 'signup' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" placeholder="Your full name" value={form.fullName} onChange={e => update('fullName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input className="form-input" placeholder="@username" value={form.username} onChange={e => update('username', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input className="form-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => update('password', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" placeholder="+234..." value={form.phone} onChange={e => update('phone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sex *</label>
                    <select className="form-select" value={form.sex} onChange={e => update('sex', e.target.value)}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Country *</label>
                  <select className="form-select" value={form.country} onChange={e => update('country', e.target.value)}>
                    <option value="">Select your country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {error && <div style={{ color: 'var(--error)', fontSize: 13, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>{error}</div>}
                <button className="btn-primary" onClick={handleSignup} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 13, marginTop: 4 }}>
                  {loading ? <span className="spinner" /> : 'Continue to Verification →'}
                </button>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
                  By signing up you agree to biometric identity verification via Eyeris to prevent duplicate accounts.
                </div>
              </div>
            )}
          </>
        )}

        {/* Close button */}
        <button onClick={closeModal} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 22, cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>×</button>
      </div>
    </div>
  );
}
