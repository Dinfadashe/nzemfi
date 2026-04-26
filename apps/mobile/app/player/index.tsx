import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useState } from 'react';
import Slider from '@react-native-community/slider';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const COLORS = {
  bg: '#0a0a0f', gold: '#f0c040', text: '#f0eeff',
  textSub: '#a89ec0', textMuted: '#6a6080', success: '#22c55e',
};

export default function PlayerScreen() {
  const insets = useSafeAreaInsets();
  const [isPlaying, setIsPlaying] = useState(true);
  const [liked, setLiked] = useState(false);
  const [progress, setProgress] = useState(0.35);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const track = { title: 'Essence', artist: 'Wizkid ft. Tems', emoji: '🌙', genre: 'Afrobeats' };
  const totalSeconds = 228;
  const currentSeconds = Math.floor(progress * totalSeconds);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1a0040', '#0a0a0f', '#0a0a0f']}
        style={StyleSheet.absoluteFill}
      />

      {/* Handle bar */}
      <View style={[styles.handleBar, { marginTop: insets.top + 8 }]}>
        <View style={styles.handle} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Text style={{ fontSize: 22, color: COLORS.textSub }}>⌄</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerLabel}>NOW PLAYING</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn}>
          <Text style={{ fontSize: 20, color: COLORS.textSub }}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={styles.artContainer}>
        <LinearGradient colors={['#7c3aed', '#1a0040']} style={styles.art}>
          <Text style={styles.artEmoji}>{track.emoji}</Text>
        </LinearGradient>
        {isPlaying && (
          <View style={styles.eqBars}>
            {[1,2,3,4].map(i => (
              <View key={i} style={[styles.eqBar, { height: 8 + Math.random() * 16 }]} />
            ))}
          </View>
        )}
      </View>

      {/* Track info */}
      <View style={styles.trackInfo}>
        <View style={styles.trackMeta}>
          <View style={{ flex: 1 }}>
            <Text style={styles.trackTitle}>{track.title}</Text>
            <Text style={styles.trackArtist}>{track.artist}</Text>
          </View>
          <TouchableOpacity onPress={() => setLiked(!liked)}>
            <Text style={[styles.likeBtn, { color: liked ? '#ef4444' : COLORS.textSub }]}>
              {liked ? '♥' : '♡'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Earn ticker */}
        {isPlaying && (
          <View style={styles.earnTicker}>
            <Text style={styles.earnTickerText}>⬡ +0.25 NZM earning</Text>
          </View>
        )}
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={progress}
          onValueChange={setProgress}
          minimumTrackTintColor="#a855f7"
          maximumTrackTintColor="rgba(255,255,255,0.1)"
          thumbTintColor={COLORS.gold}
        />
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{fmt(currentSeconds)}</Text>
          <Text style={styles.timeText}>{fmt(totalSeconds)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setIsShuffle(!isShuffle)}>
          <Text style={[styles.ctrlSm, { color: isShuffle ? COLORS.gold : COLORS.textSub }]}>⇄</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn}>
          <Text style={styles.ctrlIcon}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={styles.playBtn}>
          <LinearGradient colors={['#f0c040', '#f97316']} style={styles.playBtnGrad}>
            <Text style={styles.playBtnIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlBtn}>
          <Text style={styles.ctrlIcon}>⏭</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsRepeat(!isRepeat)}>
          <Text style={[styles.ctrlSm, { color: isRepeat ? COLORS.gold : COLORS.textSub }]}>↺</Text>
        </TouchableOpacity>
      </View>

      {/* Volume + extra */}
      <View style={styles.extras}>
        <TouchableOpacity style={styles.extraBtn}>
          <Text style={styles.extraIcon}>📃</Text>
          <Text style={styles.extraLabel}>Lyrics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.extraBtn}>
          <Text style={styles.extraIcon}>↗</Text>
          <Text style={styles.extraLabel}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.extraBtn}>
          <Text style={styles.extraIcon}>⊞</Text>
          <Text style={styles.extraLabel}>Queue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.extraBtn}>
          <Text style={styles.extraIcon}>⬇</Text>
          <Text style={styles.extraLabel}>Download</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: insets.bottom + 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  handleBar: { alignItems: 'center', marginBottom: 8 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 8 },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerLabel: { fontSize: 12, color: COLORS.textMuted, letterSpacing: 1.5, fontFamily: 'SpaceGrotesk-Regular', textAlign: 'center' },
  artContainer: { alignItems: 'center', marginTop: 24, marginBottom: 32, position: 'relative' },
  art: { width: SCREEN_W - 80, height: SCREEN_W - 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.5, shadowRadius: 40, elevation: 20 },
  artEmoji: { fontSize: 100 },
  eqBars: { position: 'absolute', bottom: -20, flexDirection: 'row', gap: 4, alignItems: 'flex-end' },
  eqBar: { width: 4, backgroundColor: COLORS.gold, borderRadius: 2 },
  trackInfo: { paddingHorizontal: 28, marginBottom: 24 },
  trackMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  trackTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, fontFamily: 'Syne-ExtraBold' },
  trackArtist: { fontSize: 16, color: COLORS.textSub, marginTop: 2, fontFamily: 'SpaceGrotesk-Regular' },
  likeBtn: { fontSize: 28, marginLeft: 12 },
  earnTicker: { backgroundColor: 'rgba(240,192,64,0.1)', borderWidth: 1, borderColor: 'rgba(240,192,64,0.25)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start' },
  earnTickerText: { fontSize: 13, color: COLORS.gold, fontFamily: 'SpaceGrotesk-Medium' },
  progressSection: { paddingHorizontal: 20, marginBottom: 16 },
  slider: { width: '100%', height: 40 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -8 },
  timeText: { fontSize: 12, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 24, marginBottom: 32 },
  ctrlSm: { fontSize: 24 },
  ctrlBtn: { padding: 8 },
  ctrlIcon: { fontSize: 28, color: COLORS.text },
  playBtn: { shadowColor: COLORS.gold, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  playBtnGrad: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  playBtnIcon: { fontSize: 28, color: '#1a1a1a' },
  extras: { flexDirection: 'row', justifyContent: 'center', gap: 28 },
  extraBtn: { alignItems: 'center', gap: 4 },
  extraIcon: { fontSize: 22, color: COLORS.textSub },
  extraLabel: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular' },
});
