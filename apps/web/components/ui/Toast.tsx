'use client';
import { useUIStore } from '@/lib/store';

export default function Toast() {
  const { toast } = useUIStore();
  if (!toast) return null;

  const colors = {
    success: { border: 'rgba(34,197,94,0.4)', icon: '✓', color: 'var(--success)' },
    error:   { border: 'rgba(239,68,68,0.4)', icon: '✕', color: '#ef4444' },
    info:    { border: 'var(--border-default)', icon: 'ℹ', color: 'var(--nzm-purple-lighter)' },
  }[toast.type];

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(var(--player-height) + 20px)',
      right: 24,
      zIndex: 2000,
      animation: 'slideUp 0.25s ease',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: `1px solid ${colors.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 18px',
        fontSize: 13.5,
        color: 'var(--text-primary)',
        maxWidth: 320,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}>
        <span style={{ color: colors.color, fontSize: 16, flexShrink: 0 }}>{colors.icon}</span>
        {toast.message}
      </div>
    </div>
  );
}
