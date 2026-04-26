'use client';
import { useState } from 'react';
import { getStreamRate, getHalvingSchedule, TOKEN_CONSTANTS, formatNZM, nzmToUsd } from '@/lib/tokenomics';
import { useAuthStore } from '@/lib/store';
import type { PageId } from '@/app/page';

// ─── Tokenomics Page ──────────────────────────────────────────────────────────
export function TokenomicsPage() {
  const [activeUsers, setActiveUsers] = useState(1000);
  const halvings = Math.floor(Math.log(Math.max(activeUsers, 100) / 100) / Math.log(100));
  const freeRate = (0.25 * Math.pow(0.5, halvings)).toFixed(4);
  const premRate = (0.5 * Math.pow(0.5, halvings)).toFixed(4);

  return (
    <div style={{ padding: '28px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>NZM Tokenomics</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>The NzemFi music economy — designed to reward listeners and empower artists.</p>

      {/* Token Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { icon: '🎵', title: 'Free User Earnings', desc: 'Ad-supported listeners earn NZM for every qualifying stream (30s+).', val: '0.25 NZM/stream', color: 'var(--nzm-purple-lighter)' },
          { icon: '⭐', title: 'Premium Earnings', desc: 'Premium subscribers earn 2× more plus ad-free, HD audio, offline downloads.', val: '0.50 NZM/stream', color: 'var(--nzm-gold)' },
          { icon: '🎤', title: 'Artist Royalty', desc: 'Artists earn 30% of every fan NZM earned on their tracks — auto on-chain.', val: '30% of fan earn', color: 'var(--nzm-orange)' },
          { icon: '👤', title: 'Fan Share', desc: '70% of stream earnings go directly to the fan who streamed the track.', val: '70% retained', color: 'var(--success)' },
          { icon: '📉', title: 'Halving Schedule', desc: 'Emission halves every 100× active user milestone to protect long-term value.', val: '100× user trigger', color: 'var(--nzm-purple-lighter)' },
          { icon: '🔐', title: 'Anti-Fraud', desc: 'Eyeris biometric KYC at signup. One face, one wallet, globally. No bots.', val: '1 wallet per human', color: 'var(--warning)' },
        ].map(c => (
          <div key={c.title} className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>{c.icon}</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>{c.title}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{c.desc}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: c.color }}>{c.val}</div>
          </div>
        ))}
      </div>

      {/* Halving Calculator */}
      <div className="card" style={{ padding: '22px', marginBottom: 22 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Halving Calculator</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>Drag to see how emission rates change as the platform grows.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <label style={{ fontSize: 12.5, color: 'var(--text-secondary)', minWidth: 110 }}>Active Users</label>
          <input type="range" min={100} max={100000000} step={100} value={activeUsers} onChange={e => setActiveUsers(Number(e.target.value))} style={{ flex: 1, accentColor: 'var(--nzm-purple)' }} />
          <span style={{ fontSize: 13, color: 'var(--nzm-gold)', minWidth: 90, textAlign: 'right' }}>
            {activeUsers >= 1000000 ? `${(activeUsers / 1000000).toFixed(1)}M` : activeUsers >= 1000 ? `${(activeUsers / 1000).toFixed(0)}K` : activeUsers}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'Halving Count', val: halvings, color: 'var(--nzm-purple-lighter)' },
            { label: 'Free Rate', val: `${freeRate} NZM`, color: 'var(--nzm-gold)' },
            { label: 'Premium Rate', val: `${premRate} NZM`, color: 'var(--nzm-gold)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-tertiary)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Halving Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700 }}>Halving Schedule</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)' }}>
              {['Active Users', 'Halvings', 'Free Rate', 'Premium Rate'].map(h => (
                <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getHalvingSchedule().map((row, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--border-subtle)', background: halvings === i ? 'rgba(124,58,237,0.07)' : 'transparent' }}>
                <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 500 }}>{row.users}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--nzm-purple-lighter)' }}>{row.halvings}</td>
                <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--nzm-gold)' }}>{row.freeRate} NZM</td>
                <td style={{ padding: '12px 20px', fontSize: 13, color: 'var(--nzm-gold)' }}>{row.premiumRate} NZM</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Explore Page ─────────────────────────────────────────────────────────────
const GENRES = [
  { name: 'Afrobeats', emoji: '🥁', bg: 'linear-gradient(135deg,#7c3aed,#1a0040)' },
  { name: 'Hip-Hop', emoji: '🎤', bg: 'linear-gradient(135deg,#f97316,#401a00)' },
  { name: 'R&B / Soul', emoji: '🎶', bg: 'linear-gradient(135deg,#ec4899,#3a001a)' },
  { name: 'Highlife', emoji: '🎷', bg: 'linear-gradient(135deg,#06b6d4,#003a4a)' },
  { name: 'Gospel', emoji: '✝', bg: 'linear-gradient(135deg,#f0c040,#3a2a00)' },
  { name: 'Reggae', emoji: '🌿', bg: 'linear-gradient(135deg,#22c55e,#003a10)' },
  { name: 'Amapiano', emoji: '🎹', bg: 'linear-gradient(135deg,#f97316,#7c3aed)' },
  { name: 'Fuji', emoji: '🥁', bg: 'linear-gradient(135deg,#ec4899,#06b6d4)' },
  { name: 'Jùjú', emoji: '🎸', bg: 'linear-gradient(135deg,#22c55e,#f0c040)' },
];

export function ExplorePage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  return (
    <div style={{ padding: '28px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 20 }}>Explore</h1>
      <div style={{ marginBottom: 28 }}>
        <div className="section-header"><span className="section-title">Browse Genres</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {GENRES.map(g => (
            <div key={g.name} style={{ background: g.bg, border: '1px solid var(--border-subtle)', borderRadius: 14, padding: '24px 16px', textAlign: 'center', cursor: 'pointer', transition: 'var(--transition)' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <div style={{ fontSize: 34, marginBottom: 8 }}>{g.emoji}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{g.name}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="section-header"><span className="section-title">🌍 African Artists to Watch</span></div>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          {['Asake','Zinoleesky','BNXN','Seun Kuti','Femi Otedola'].map((a, i) => (
            <div key={a} className="card" style={{ minWidth: 130, textAlign: 'center', padding: '18px 12px', cursor: 'pointer' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: ['linear-gradient(135deg,#7c3aed,#1a0040)','linear-gradient(135deg,#f97316,#401a00)','linear-gradient(135deg,#ec4899,#3a001a)','linear-gradient(135deg,#06b6d4,#003a4a)','linear-gradient(135deg,#22c55e,#003a10)'][i], margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {['⚡','🍦','🎵','🎷','🎸'][i]}
              </div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{a}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Afrobeats</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Analytics Page ───────────────────────────────────────────────────────────
export function AnalyticsPage() {
  const { user } = useAuthStore();
  const STATS = [
    { label: 'Total Streams', val: '284.5K', sub: '↑ 18% this month', color: 'var(--nzm-purple-lighter)' },
    { label: 'NZM Earned', val: '8,234', sub: '↑ 2,100 this month', color: 'var(--nzm-gold)' },
    { label: 'Followers', val: '12.4K', sub: '↑ 340 new', color: 'var(--text-primary)' },
    { label: 'Countries', val: '47', sub: 'Active listeners', color: 'var(--text-primary)' },
  ];

  return (
    <div style={{ padding: '28px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 20 }}>Artist Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.label} className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Earnings over time bar chart */}
      <div className="card" style={{ padding: '20px', marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Monthly Earnings (NZM)</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
          {[400, 680, 520, 900, 750, 1100, 980, 1340, 1200, 1600, 1450, 1800].map((v, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', background: i === 11 ? 'linear-gradient(180deg, var(--nzm-purple), var(--nzm-gold))' : 'var(--bg-hover)', borderRadius: '4px 4px 0 0', height: `${(v / 1800) * 100}px`, minHeight: 4, transition: 'var(--transition)' }} />
              <div style={{ fontSize: 9, color: 'var(--text-muted)', writing: 'vertical-rl' }}>{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top tracks */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Top Tracks This Month</div>
        {['Essence','Last Last','Peru','Calm Down','Finesse'].map((title, i) => {
          const pct = 90 - i * 15;
          return (
            <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 14, marginBottom: 14, borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 18 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 6 }}>{title}</div>
                <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 2 }}>
                  <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, var(--nzm-purple), var(--nzm-gold))' }} />
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--nzm-gold)', minWidth: 70, textAlign: 'right' }}>{Math.round(pct * 2840).toLocaleString()} streams</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Library Page ─────────────────────────────────────────────────────────────
export function LibraryPage() {
  const [tab, setTab] = useState(0);
  const tabs = ['Playlists', 'Albums', 'Artists', 'Downloads'];
  const playlists = [
    { name: 'My Afrobeats Mix', tracks: 12, emoji: '🎵', bg: 'linear-gradient(135deg,#7c3aed,#1a0040)' },
    { name: 'Late Night Vibes', tracks: 8, emoji: '🌙', bg: 'linear-gradient(135deg,#f97316,#401a00)' },
    { name: 'Workout Hits', tracks: 24, emoji: '💪', bg: 'linear-gradient(135deg,#22c55e,#003a10)' },
    { name: 'Chill Sunday', tracks: 6, emoji: '☕', bg: 'linear-gradient(135deg,#ec4899,#3a001a)' },
  ];

  return (
    <div style={{ padding: '28px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>My Library</h1>
        <button className="btn-outline" style={{ padding: '8px 16px', fontSize: 13 }}>+ New Playlist</button>
      </div>
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', borderRadius: 12, padding: 4, marginBottom: 22 }}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            flex: 1, padding: '8px', borderRadius: 8, border: 'none',
            background: tab === i ? 'rgba(124,58,237,0.25)' : 'transparent',
            color: tab === i ? 'var(--nzm-purple-lighter)' : 'var(--text-secondary)',
            fontSize: 13, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'var(--transition)',
          }}>{t}</button>
        ))}
      </div>
      {tab === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {playlists.map(p => (
            <div key={p.name} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', cursor: 'pointer' }}>
              <div style={{ width: 46, height: 46, borderRadius: 10, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{p.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{p.tracks} tracks</div>
              </div>
              <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>›</span>
            </div>
          ))}
        </div>
      )}
      {tab !== 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
          <div style={{ fontSize: 14 }}>No {tabs[tab].toLowerCase()} yet</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Start streaming to build your library</div>
        </div>
      )}
    </div>
  );
}

// ─── Liked Songs Page ─────────────────────────────────────────────────────────
const LIKED_SONGS = [
  { id: '1', title: 'Essence', artist: 'Wizkid ft. Tems', emoji: '🌙', duration: '3:48' },
  { id: '2', title: 'Last Last', artist: 'Burna Boy', emoji: '🔥', duration: '3:27' },
  { id: '3', title: 'Calm Down', artist: 'Rema', emoji: '🎵', duration: '3:57' },
  { id: '4', title: 'Peru', artist: 'Fireboy DML', emoji: '✨', duration: '3:15' },
];

export function LikedPage() {
  return (
    <div style={{ padding: '28px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
        <div style={{ width: 60, height: 60, borderRadius: 14, background: 'linear-gradient(135deg,var(--nzm-purple),var(--nzm-orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>♥</div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>Liked Songs</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{LIKED_SONGS.length} tracks</div>
        </div>
      </div>
      <button className="btn-primary" style={{ marginBottom: 20 }}>▶ Play All</button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {LIKED_SONGS.map((t, i) => (
          <div key={t.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', cursor: 'pointer' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', minWidth: 20 }}>{i + 1}</div>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'linear-gradient(135deg,var(--nzm-purple),var(--bg-card))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{t.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>{t.artist}</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--nzm-gold)' }}>+0.25 NZM</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 36, textAlign: 'right' }}>{t.duration}</div>
            <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 18, cursor: 'pointer' }}>♥</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { user } = useAuthStore();
  const [editing, setEditing] = useState(false);

  return (
    <div style={{ padding: '28px 24px', maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,var(--nzm-purple),var(--nzm-orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: 'white', flexShrink: 0 }}>
          {user?.full_name?.slice(0, 2).toUpperCase() || 'U'}
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>{user?.full_name || 'Guest User'}</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>@{user?.username || 'username'}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {user?.is_premium ? <span className="badge badge-gold">⭐ Premium</span> : <span className="badge badge-purple">Free</span>}
            {user?.is_verified_artist && <span className="badge badge-green">✓ Verified Artist</span>}
          </div>
        </div>
        <button className="btn-outline" onClick={() => setEditing(!editing)} style={{ marginLeft: 'auto', padding: '8px 16px', fontSize: 13 }}>
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'NZM Balance', val: (user?.nzm_balance || 0).toFixed(2), color: 'var(--nzm-gold)' },
          { label: 'Total Streams', val: (user?.total_streams || 0).toLocaleString(), color: 'var(--nzm-purple-lighter)' },
          { label: 'Country', val: user?.country || '—', color: 'var(--text-primary)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Settings links */}
      <div className="card" style={{ padding: '4px 0' }}>
        {[
          { icon: '🎤', label: 'Become an Artist', sub: 'Upload music and earn royalties', action: 'Apply' },
          { icon: '⭐', label: 'Upgrade to Premium', sub: '2× earnings + HD audio + offline', action: '$1/mo' },
          { icon: '◈', label: 'Connect BSC Wallet', sub: 'Link your BEP-20 wallet for withdrawals', action: 'Connect' },
          { icon: '🔐', label: 'Privacy & Security', sub: 'Change password, 2FA, sessions', action: '›' },
          { icon: '🔔', label: 'Notifications', sub: 'Manage what you receive', action: '›' },
          { icon: '⊡', label: 'Account & Data', sub: 'Download your data, delete account', action: '›' },
        ].map((item, i, arr) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{item.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>{item.sub}</div>
            </div>
            <span style={{ fontSize: 13, color: 'var(--nzm-purple-lighter)', fontWeight: 500 }}>{item.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TokenomicsPage;
