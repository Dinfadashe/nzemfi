'use client';
import Image from 'next/image';
import { useAuthStore, useUIStore } from '@/lib/store';
import { formatNZM } from '@/lib/tokenomics';
import type { PageId } from '@/app/page';

interface NavItem {
  id: PageId;
  label: string;
  icon: string;
  artistOnly?: boolean;
}

const NAV_ITEMS: { section: string; items: NavItem[] }[] = [
  {
    section: 'Discover',
    items: [
      { id: 'home', label: 'Home', icon: '⌂' },
      { id: 'explore', label: 'Explore', icon: '⊞' },
      { id: 'charts', label: 'Charts', icon: '↑' },
    ],
  },
  {
    section: 'My Music',
    items: [
      { id: 'library', label: 'Library', icon: '♪' },
      { id: 'liked', label: 'Liked Songs', icon: '♡' },
    ],
  },
  {
    section: 'Earn',
    items: [
      { id: 'wallet', label: 'Wallet', icon: '◈' },
      { id: 'tokenomics', label: 'Tokenomics', icon: '⬡' },
    ],
  },
  {
    section: 'Artist',
    items: [
      { id: 'upload', label: 'Upload Music', icon: '↑' },
      { id: 'analytics', label: 'Analytics', icon: '◎' },
    ],
  },
];

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const { user } = useAuthStore();
  const { openModal } = useUIStore();

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      minWidth: 'var(--sidebar-width)',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <Image
          src="/logo.png"
          alt="NzemFi"
          width={36}
          height={36}
          style={{ borderRadius: 8 }}
        />
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 800,
            background: 'var(--nzm-gradient-text)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.3px',
          }}>
            NzemFi
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Stream · Support · Earn
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {NAV_ITEMS.map(({ section, items }) => (
          <div key={section} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 10, color: 'var(--text-muted)',
              letterSpacing: '1.5px', textTransform: 'uppercase',
              padding: '0 10px', marginBottom: 6,
            }}>
              {section}
            </div>
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: activePage === item.id
                    ? 'rgba(124,58,237,0.15)'
                    : 'transparent',
                  border: activePage === item.id
                    ? '1px solid var(--border-subtle)'
                    : '1px solid transparent',
                  color: activePage === item.id
                    ? 'var(--nzm-purple-lighter)'
                    : 'var(--text-secondary)',
                  fontSize: 13.5,
                  fontWeight: activePage === item.id ? 500 : 400,
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                  marginBottom: 2,
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Token Balance Card */}
      <div style={{
        margin: '8px',
        padding: '14px',
        background: 'linear-gradient(135deg, rgba(124,58,237,0.18), rgba(249,115,22,0.08))',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '16px',
      }}>
        {user ? (
          <>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1, textTransform: 'uppercase' }}>
              NZM Balance
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--nzm-gold)',
              margin: '4px 0 2px',
            }}>
              {user.nzm_balance.toFixed(2)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              ≈ ${(user.nzm_balance * 0.01).toFixed(2)} USD
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: 'var(--success)',
              fontSize: 10,
              padding: '3px 8px',
              borderRadius: 20,
              marginTop: 8,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
              +0.25 NZM per stream
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
              Sign in to start earning NZM tokens
            </div>
            <button className="btn-primary" onClick={() => openModal('auth')} style={{ width: '100%', justifyContent: 'center' }}>
              Get Started
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
