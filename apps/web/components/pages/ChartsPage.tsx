'use client';
// Charts Page
import { useState } from 'react';
import { usePlayerStore } from '@/lib/store';

const CHART_TRACKS = [
  { id: '1', rank: 1, title: 'Calm Down', artist: 'Rema', emoji: '🎵', streams: '320M', change: '+2', genre: 'Afropop' },
  { id: '2', rank: 2, title: 'Essence', artist: 'Wizkid ft. Tems', emoji: '🌙', streams: '284M', change: '—', genre: 'Afrobeats' },
  { id: '3', rank: 3, title: 'Last Last', artist: 'Burna Boy', emoji: '🔥', streams: '198M', change: '+1', genre: 'Afrobeats' },
  { id: '4', rank: 4, title: 'Peru', artist: 'Fireboy DML', emoji: '✨', streams: '156M', change: '-1', genre: 'Afropop' },
  { id: '5', rank: 5, title: 'Unavailable', artist: 'Davido', emoji: '👑', streams: '122M', change: '+3', genre: 'Afrobeats' },
  { id: '6', rank: 6, title: 'Finesse', artist: 'Pheelz ft. BNXN', emoji: '💫', streams: '88M', change: '+2', genre: 'Afrobeats' },
  { id: '7', rank: 7, title: 'Gelato', artist: 'Zinoleesky', emoji: '🍦', streams: '76M', change: 'NEW', genre: 'Afropop' },
  { id: '8', rank: 8, title: 'Commas', artist: 'Kizz Daniel', emoji: '🎶', streams: '71M', change: '+1', genre: 'Afrobeats' },
  { id: '9', rank: 9, title: 'Terminator', artist: 'Asake', emoji: '⚡', streams: '65M', change: '+4', genre: 'Afrobeats' },
  { id: '10', rank: 10, title: 'B.D.C', artist: 'Olamide', emoji: '🎤', streams: '58M', change: '-2', genre: 'Hip-Hop' },
] as any[];

const CHART_TABS = ['Top 50 Global', 'Africa Top 50', 'Afrobeats', 'Hip-Hop', 'Highlife', 'Gospel'];

export function ChartsPage() {
  const { play } = usePlayerStore();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div style={{ padding: '28px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Global Charts</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Updated daily · Earn NZM on every stream</p>

      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', borderRadius: 12, padding: 4, marginBottom: 24, overflowX: 'auto' }}>
        {CHART_TABS.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} style={{
            padding: '8px 14px', borderRadius: 8, border: 'none', whiteSpace: 'nowrap',
            background: activeTab === i ? 'rgba(124,58,237,0.25)' : 'transparent',
            color: activeTab === i ? 'var(--nzm-purple-lighter)' : 'var(--text-secondary)',
            fontSize: 13, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'var(--transition)',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {CHART_TRACKS.map((t, i) => (
          <div key={t.id} onClick={() => play(t as any, CHART_TRACKS as any)} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12,
            cursor: 'pointer', transition: 'var(--transition)',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-card)')}
          >
            <div style={{ minWidth: 28, fontSize: 15, fontWeight: 700, color: i < 3 ? 'var(--nzm-gold)' : 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>{t.rank}</div>
            <div style={{ width: 42, height: 42, borderRadius: 8, background: 'linear-gradient(135deg,var(--nzm-purple),var(--bg-card))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{t.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>{t.artist}</div>
            </div>
            <span className="badge badge-purple" style={{ fontSize: 10 }}>{t.genre}</span>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 50, textAlign: 'right' }}>{t.streams}</div>
            <div style={{ fontSize: 12, minWidth: 32, textAlign: 'right', color: t.change.startsWith('+') ? 'var(--success)' : t.change === '—' ? 'var(--text-muted)' : t.change === 'NEW' ? 'var(--nzm-gold)' : '#ef4444' }}>{t.change}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChartsPage;
