'use client';
import { useState } from 'react';
import { useAuthStore, useUIStore } from '@/lib/store';
import type { PageId } from '@/app/page';

interface TopBarProps {
  onNavigate: (page: PageId) => void;
}

export default function TopBar({ onNavigate }: TopBarProps) {
  const { user } = useAuthStore();
  const { openModal } = useUIStore();
  const [query, setQuery] = useState('');

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10,10,15,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    }}>
      {/* Search */}
      <div style={{
        flex: 1,
        maxWidth: 400,
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-full)',
        padding: '9px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search songs, artists, albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: 13.5,
            fontFamily: 'var(--font-body)',
            flex: 1,
          }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ background: 'none', color: 'var(--text-muted)', fontSize: 16, cursor: 'pointer' }}>
            ×
          </button>
        )}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {user?.is_premium ? (
          <span className="badge badge-gold">PREMIUM ⭐</span>
        ) : (
          <span className="badge badge-purple">FREE</span>
        )}

        {/* Notifications */}
        <button style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'var(--transition)',
          position: 'relative',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 7,
            height: 7,
            background: 'var(--nzm-purple)',
            borderRadius: '50%',
            border: '1.5px solid var(--bg-secondary)',
          }} />
        </button>

        {user ? (
          <button
            onClick={() => onNavigate('profile')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--nzm-purple), var(--nzm-orange))',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 600,
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {user.full_name.slice(0, 2).toUpperCase()}
          </button>
        ) : (
          <button className="btn-primary" onClick={() => openModal('auth')} style={{ padding: '8px 18px', fontSize: 13 }}>
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
