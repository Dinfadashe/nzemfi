import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface MiniPlayerProps {
  track: { title: string; artist: string; emoji: string } | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  nzmEarned: number;
}

export default function MiniPlayer({ track, isPlaying, onTogglePlay, nzmEarned }: MiniPlayerProps) {
  const insets = useSafeAreaInsets();

  if (!track) return null;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push('/player')}
      style={[styles.container, { bottom: 60 + insets.bottom }]}
    >
      <LinearGradient
        colors={['rgba(124,58,237,0.95)', 'rgba(249,115,22,0.9)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {/* Art */}
        <View style={styles.art}>
          <Text style={styles.artEmoji}>{track.emoji}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>{track.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
        </View>

        {/* Earn badge */}
        {isPlaying && (
          <View style={styles.earnBadge}>
            <Text style={styles.earnText}>+0.25 NZM</Text>
          </View>
        )}

        {/* Controls */}
        <TouchableOpacity onPress={onTogglePlay} style={styles.playBtn}>
          <Text style={styles.playBtnText}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>⏭</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Progress bar */}
      <View style={styles.progress}>
        <View style={styles.progressFill} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  art: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artEmoji: { fontSize: 22 },
  info: { flex: 1 },
  title: { fontSize: 13.5, fontWeight: '600', color: 'white', fontFamily: 'SpaceGrotesk-SemiBold' },
  artist: { fontSize: 11.5, color: 'rgba(255,255,255,0.75)', marginTop: 1, fontFamily: 'SpaceGrotesk-Regular' },
  earnBadge: {
    backgroundColor: 'rgba(240,192,64,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(240,192,64,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  earnText: { fontSize: 10, color: '#f0c040', fontFamily: 'SpaceGrotesk-Medium' },
  playBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  playBtnText: { fontSize: 16, color: 'white' },
  nextBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { fontSize: 18, color: 'rgba(255,255,255,0.8)' },
  progress: { height: 2, backgroundColor: 'rgba(255,255,255,0.1)' },
  progressFill: { height: '100%', width: '35%', backgroundColor: 'rgba(240,192,64,0.7)', borderRadius: 1 },
});
