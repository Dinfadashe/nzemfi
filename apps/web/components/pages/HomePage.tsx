'use client';
import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/lib/store';
import type { PageId } from '@/app/page';

const MOCK_TRACKS = [
  { id: '1', title: 'Essence', artist: 'Wizkid ft. Tems', emoji: '🌙', genre: 'Afrobeats', streams: '284M', audio_url: '', cover_url: '', duration_seconds: 228, is_exclusive: false, is_published: true, copyright_status: 'cleared', audio_quality: 'hd', stream_count: 284000000, like_count: 0, album_id: null, artist_id: 'a1', lyrics: null, release_date: null, copyright_fingerprint: null, created_at: '' },
  { id: '2', title: 'Last Last', artist: 'Burna Boy', emoji: '🔥', genre: 'Afrobeats', streams: '198M', audio_url: '', cover_url: '', duration_seconds: 207, is_exclusive: false, is_published: true, copyright_status: 'cleared', audio_quality: 'hd', stream_count: 198000000, like_count: 0, album_id: null, artist_id: 'a2', lyrics: null, release_date: null, copyright_fingerprint: null, created_at: '' },
  { id: '3', title: 'Peru', artist: 'Fireboy DML', emoji: '✨', genre: 'Afropop', streams: '156M', audio_url: '', cover_url: '', duration_seconds: 195, is_exclusive: false, is_published: true, copyright_status: 'cleared', audio_quality: 'standard', stream_count: 156000000, like_count: 0, album_id: null, artist_id: 'a3', lyrics: null, release_date: null, copyright_fingerprint: null, created_at: '' },
  { id: '4', title: 'Finesse', artist: 'Pheelz ft. BNXN', emoji: '💫', genre: 'Afrobeats', streams: '88M', audio_url: '', cover_url: '', duration_seconds: 214, is_exclusive: false, is_published: true, copyright_status: 'cleared', audio_quality: 'hd', stream_count: 88000000, like_count: 0, album_id: null, artist_id: 'a4', lyrics: null, release_date: null, copyright_fingerprint: null, created_at: '' },
  { id: '5', title: 'Calm Down', artist: 'Rema', emoji: '🎶', genre: 'Afropop', streams: '320M', audio_url: '', cover_url: '', duration_seconds: 237, is_exclusive: false, is_published: true, copyright_status: 'cleared', audio_quality: 'hd', stream_count: 320000000, like_count: 0, album_id: null, artist_id: 'a5', lyrics: null, release_date: null, copyright_fingerprint: null, created_at: '' },
  { id: '6', title: 'Unavailable', artist: 'Davido', emoji: '👑', genre: 'Afrobeats', streams: '122M', audio_url: '', cover_url: '', duration_seconds: 198, is_exclusive: false, is_published: true, copyright_status: 'cleared', audio_quality: 'standard', stream_count: 122000000, like_count: 0, album_id: null, artist_id: 'a6', lyrics: null, release_date: null, copyright_fingerprint: null, created_at: '' },
] as any[];

const MOCK_ARTISTS = [
  { name: 'Wizkid', emoji: '🌙', followers: '8.2M', genre: 'Afrobeats' },
  { name: 'Burna Boy', emoji: '🔥', followers: '6.4M', genre: 'Afrobeats' },
  { name: 'Tems', emoji: '✨', followers: '4.1M', genre: 'R&B' },
  { name: 'Rema', emoji: '🎵', followers: '5.6M', genre: 'Afropop' },
  { name: 'Davido', emoji: '👑', followers: '7.1M', genre: 'Afrobeats' },
  { name: 'Tiwa Savage', emoji: '🌸', followers: '3.6M', genre: 'Afropop' },
];

const CARD_GRADIENTS = [
  'linear-gradient(135deg,#7c3aed,#1a0040)',
  'linear-gradient(135deg,#f97316,#401a00)',
  'linear-gradient(135deg,#ec4899,#3a001a)',
  'linear-gradient(135deg,#06b6d4,#003a4a)',
  'linear-gradient(135deg,#22c55e,#003a10)',
  'linear-gradient(135deg,#f0c040,#3a2a00)',
];

interface HomePageProps { onNavigate: (page: PageId) => void; }

export default function HomePage({ onNavigate }: HomePageProps) {
  const { play } = usePlayerStore();

  return (
    <div style={{ padding: '28px 24px' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.22) 0%, rgba(249,115,22,0.08) 60%, transparent 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 20,
        padding: '32px 28px',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.3)', color: 'var(--nzm-gold)', fontSize: 11, padding: '4px 12px', borderRadius: 20, marginBottom: 14, letterSpacing: 0.5 }}>
          ✦ EARN WHILE YOU LISTEN
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 10 }}>
          Music is now your <span style={{ background: 'var(--nzm-gradient-text)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>economy</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14.5, lineHeight: 1.7, maxWidth: 440, marginBottom: 22 }}>
          Stream your favorite artists and earn NZM tokens on every play. Free users earn 0.25 NZM, premium users earn 0.50 NZM per stream.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => play(MOCK_TRACKS[0], MOCK_TRACKS)}>
            ▶ Start Listening
          </button>
          <button className="btn-outline" onClick={() => onNavigate('tokenomics')}>
            ⬡ How Earning Works
          </button>
        </div>

        {/* Live stats row */}
        <div style={{ display: 'flex', gap: 24, marginTop: 28, flexWrap: 'wrap' }}>
          {[
            { label: 'Active Listeners', value: '124K', icon: '👥' },
            { label: 'NZM Distributed Today', value: '31,000', icon: '⬡' },
            { label: 'Artists on Platform', value: '8,400+', icon: '🎤' },
            { label: 'Countries', value: '74', icon: '🌍' },
          ].map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--nzm-gold)' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending */}
      <Section title="🔥 Trending Now" onSeeAll={() => onNavigate('charts')}>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          {MOCK_TRACKS.map((t, i) => (
            <SongCard key={t.id} track={t} gradient={CARD_GRADIENTS[i % CARD_GRADIENTS.length]} onPlay={() => play(t, MOCK_TRACKS)} />
          ))}
        </div>
      </Section>

      {/* Top Artists */}
      <Section title="Top Artists" onSeeAll={() => onNavigate('explore')}>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          {MOCK_ARTISTS.map((a, i) => (
            <ArtistCard key={a.name} artist={a} gradient={CARD_GRADIENTS[i % CARD_GRADIENTS.length]} />
          ))}
        </div>
      </Section>

      {/* New Releases */}
      <Section title="✨ New Releases" onSeeAll={() => onNavigate('explore')}>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          {[...MOCK_TRACKS].reverse().map((t, i) => (
            <SongCard key={t.id + 'nr'} track={t} gradient={CARD_GRADIENTS[(i + 2) % CARD_GRADIENTS.length]} onPlay={() => play(t, MOCK_TRACKS)} />
          ))}
        </div>
      </Section>

      {/* Earn CTA */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 8,
      }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(168,85,247,0.1))', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '22px 20px' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>⬡</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Earn NZM Tokens</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>0.25 NZM per stream (free) · 0.50 NZM (premium). Withdraw anytime to your BSC wallet.</div>
          <button className="btn-outline" onClick={() => onNavigate('wallet')} style={{ fontSize: 13, padding: '8px 16px' }}>Open Wallet</button>
        </div>
        <div style={{ background: 'linear-gradient(135deg, rgba(240,192,64,0.12), rgba(249,115,22,0.08))', border: '1px solid rgba(240,192,64,0.2)', borderRadius: 16, padding: '22px 20px' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🎤</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Upload Your Music</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>100% free uploads. Earn 30% of every fan stream as royalties, paid automatically on-chain.</div>
          <button className="btn-outline" onClick={() => onNavigate('upload')} style={{ fontSize: 13, padding: '8px 16px', borderColor: 'rgba(240,192,64,0.3)', color: 'var(--nzm-gold)' }}>Start Uploading</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, onSeeAll, children }: { title: string; onSeeAll?: () => void; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div className="section-header">
        <span className="section-title">{title}</span>
        {onSeeAll && <span className="see-all" onClick={onSeeAll}>See all</span>}
      </div>
      {children}
    </div>
  );
}

function SongCard({ track, gradient, onPlay }: { track: any; gradient: string; onPlay: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="card"
      onClick={onPlay}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ minWidth: 155, padding: 12, cursor: 'pointer', transform: hovered ? 'translateY(-3px)' : 'none', transition: 'var(--transition)' }}
    >
      <div style={{ width: '100%', aspectRatio: '1', borderRadius: 10, background: gradient, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', fontSize: 34 }}>
        {track.emoji}
        {hovered && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, fontSize: 26 }}>▶</div>
        )}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.title}</div>
      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>{track.artist}</div>
      <div style={{ fontSize: 10.5, color: 'var(--nzm-gold)', marginTop: 5, display: 'flex', alignItems: 'center', gap: 3 }}>
        ⬡ +0.25 NZM/stream
      </div>
    </div>
  );
}

function ArtistCard({ artist, gradient }: { artist: any; gradient: string }) {
  return (
    <div className="card" style={{ minWidth: 130, textAlign: 'center', padding: '18px 12px', cursor: 'pointer' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: gradient, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
        {artist.emoji}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500 }}>{artist.name}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{artist.followers} followers</div>
      <div style={{ fontSize: 10, color: 'var(--nzm-purple-lighter)', marginTop: 4 }}>{artist.genre}</div>
    </div>
  );
}
