'use client';
import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { Track, User } from '../supabase/database.types';

// ── Player Store ──────────────────────────────────────────────────────────────
export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  progress: number; // 0-100
  duration: number; // seconds
  isShuffle: boolean;
  isRepeat: boolean;
  isRepeatOne: boolean;
  currentEarning: number;
  sessionEarned: number;

  // Actions
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  addEarning: (amount: number) => void;
}

export const usePlayerStore = create<PlayerState>()(
  subscribeWithSelector((set, get) => ({
    currentTrack: null,
    queue: [],
    queueIndex: 0,
    isPlaying: false,
    volume: 0.8,
    progress: 0,
    duration: 0,
    isShuffle: false,
    isRepeat: false,
    isRepeatOne: false,
    currentEarning: 0,
    sessionEarned: 0,

    play: (track, queue) => {
      const q = queue ?? get().queue;
      const idx = q.findIndex((t) => t.id === track.id);
      set({
        currentTrack: track,
        queue: q,
        queueIndex: idx >= 0 ? idx : 0,
        isPlaying: true,
        progress: 0,
      });
    },

    pause: () => set({ isPlaying: false }),
    resume: () => set({ isPlaying: true }),
    togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

    next: () => {
      const { queue, queueIndex, isShuffle, isRepeat } = get();
      if (!queue.length) return;
      let nextIdx: number;
      if (isShuffle) {
        nextIdx = Math.floor(Math.random() * queue.length);
      } else {
        nextIdx = queueIndex + 1;
        if (nextIdx >= queue.length) {
          if (isRepeat) nextIdx = 0;
          else { set({ isPlaying: false }); return; }
        }
      }
      set({ queueIndex: nextIdx, currentTrack: queue[nextIdx], isPlaying: true, progress: 0 });
    },

    prev: () => {
      const { queue, queueIndex, progress } = get();
      if (progress > 5) { set({ progress: 0 }); return; }
      const prevIdx = Math.max(0, queueIndex - 1);
      set({ queueIndex: prevIdx, currentTrack: queue[prevIdx], isPlaying: true, progress: 0 });
    },

    seek: (progress) => set({ progress }),
    setVolume: (volume) => set({ volume }),
    toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),
    toggleRepeat: () =>
      set((s) => ({
        isRepeat: !s.isRepeat && !s.isRepeatOne,
        isRepeatOne: s.isRepeat && !s.isRepeatOne,
      })),

    addToQueue: (track) => set((s) => ({ queue: [...s.queue, track] })),
    removeFromQueue: (index) =>
      set((s) => ({ queue: s.queue.filter((_, i) => i !== index) })),
    clearQueue: () => set({ queue: [], queueIndex: 0 }),

    setProgress: (progress) => set({ progress }),
    setDuration: (duration) => set({ duration }),
    addEarning: (amount) =>
      set((s) => ({
        sessionEarned: s.sessionEarned + amount,
        currentEarning: s.currentEarning + amount,
      })),
  }))
);

// ── Auth / User Store ─────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updateBalance: (newBalance: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      updateBalance: (newBalance) =>
        set((s) => ({ user: s.user ? { ...s.user, nzm_balance: newBalance } : null })),
    }),
    {
      name: 'nzemfi-auth',
      partialize: (s) => ({ user: s.user }),
    }
  )
);

// ── UI Store ──────────────────────────────────────────────────────────────────
interface UIState {
  activeModal: string | null;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  openModal: (name: string) => void;
  closeModal: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeModal: null,
  toast: null,
  openModal: (name) => set({ activeModal: name }),
  closeModal: () => set({ activeModal: null }),
  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3500);
  },
}));
