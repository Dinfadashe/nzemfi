'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { usePlayerStore, useAuthStore } from '@/lib/store';
import { formatDuration, getStreamRate } from '@/lib/tokenomics';

export default function Player() {
  const {
    currentTrack, isPlaying, volume, progress, duration, isShuffle,
    isRepeat, isRepeatOne, sessionEarned,
    togglePlay, next, prev, toggleShuffle, toggleRepeat,
    setProgress, setDuration, addEarning, play,
  } = usePlayerStore();

  const { user, updateBalance } = useAuthStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const listenedRef = useRef(0);
  const earnedThisTrackRef = useRef(false);
  const [liked, setLiked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Init audio
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      if (!isDragging && audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        listenedRef.current = audio.currentTime;
      }
    });
    audio.addEventListener('durationchange', () => setDuration(audio.duration || 0));
    audio.addEventListener('ended', () => next());
    audio.addEventListener('loadeddata', () => { earnedThisTrackRef.current = false; });

    return () => { audio.pause(); };
  }, []);

  // Load track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.src = currentTrack.audio_url;
    audio.load();
    listenedRef.current = 0;
    earnedThisTrackRef.current = false;
    if (isPlaying) audio.play().catch(() => {});
  }, [currentTrack]);

  // Play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  // Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Earn NZM after 30s
  useEffect(() => {
    if (!isPlaying || !currentTrack || !user || earnedThisTrackRef.current) return;
    if (listenedRef.current >= 30) {
      earnedThisTrackRef.current = true;
      const tier = user.is_premium ? 'premium' : 'free';
      const rate = getStreamRate(tier, 1000); // TODO: fetch real user count
      const fanEarn = parseFloat((rate * 0.7).toFixed(4));
      addEarning(fanEarn);
      updateBalance((user.nzm_balance || 0) + fanEarn);
    }
  }, [Math.floor(listenedRef.current)]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    if (audioRef.current && duration) {
      audioRef.current.currentTime = pct * duration;
      setProgress(pct * 100);
    }
  };

  const currentTime = (progress / 100) * duration;

  if (!currentTrack) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--player-height)',
        background: 'rgba(18,18,26,0.97)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Select a track to start earning NZM ⬡
        </span>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--player-height)',
      background: 'rgba(18,18,26,0.97)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      zIndex: 100,
    }}>
      {/* Track Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 220, flex: '0 0 220px' }}>
        <div style={{
          width: 46,
          height: 46,
          borderRadius: 8,
          background: 'linear-gradient(135deg, var(--nzm-purple), var(--bg-card))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          {currentTrack.cover_url ? (
            <img src={currentTrack.cover_url} alt={currentTrack.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : '🎵'}
        </div>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentTrack.title}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 1 }}>
            Artist
          </div>
        </div>
        <button
          onClick={() => setLiked(!liked)}
          style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: liked ? '#ef4444' : 'var(--text-muted)', transition: 'var(--transition)', flexShrink: 0 }}
        >
          {liked ? '♥' : '♡'}
        </button>
      </div>

      {/* Controls */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <CtrlBtn
            onClick={toggleShuffle}
            active={isShuffle}
            title="Shuffle"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
            </svg>
          </CtrlBtn>
          <CtrlBtn onClick={prev} title="Previous">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </CtrlBtn>
          <button
            onClick={togglePlay}
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'var(--nzm-gold)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition)',
              color: '#1a1a1a',
              flexShrink: 0,
            }}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
            )}
          </button>
          <CtrlBtn onClick={next} title="Next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </CtrlBtn>
          <CtrlBtn onClick={toggleRepeat} active={isRepeat || isRepeatOne} title="Repeat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            {isRepeatOne && <span style={{ position: 'absolute', bottom: 0, right: 0, fontSize: 9, fontWeight: 700 }}>1</span>}
          </CtrlBtn>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 34, textAlign: 'right' }}>
            {formatDuration(currentTime)}
          </span>
          <div
            onClick={handleProgressClick}
            style={{
              flex: 1,
              height: 3,
              background: 'var(--bg-hover)',
              borderRadius: 2,
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <div style={{
              height: '100%',
              borderRadius: 2,
              background: 'linear-gradient(90deg, var(--nzm-purple), var(--nzm-gold))',
              width: `${progress}%`,
              transition: isDragging ? 'none' : 'width 0.1s linear',
            }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 34 }}>
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 200, justifyContent: 'flex-end', flex: '0 0 200px' }}>
        {/* Earn ticker */}
        {isPlaying && user && (
          <div className="earn-ticker">
            <span>⬡</span>
            <span>+{user.is_premium ? '0.50' : '0.25'} NZM</span>
          </div>
        )}

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => usePlayerStore.getState().setVolume(Number(e.target.value))}
            style={{ width: 72, accentColor: 'var(--nzm-purple)' }}
          />
        </div>
      </div>
    </div>
  );
}

function CtrlBtn({ children, onClick, active, title }: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: 'none',
        border: 'none',
        color: active ? 'var(--nzm-gold)' : 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'var(--transition)',
        position: 'relative',
      }}
    >
      {children}
    </button>
  );
}
