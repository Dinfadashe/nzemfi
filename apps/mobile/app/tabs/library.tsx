import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

const COLORS = {
  bg: '#0a0a0f', card: '#1e1e2e', purple: '#7c3aed',
  purpleLight: '#a855f7', gold: '#f0c040',
  text: '#f0eeff', textSub: '#a89ec0', textMuted: '#6a6080',
  border: 'rgba(124,58,237,0.2)',
};

const TABS = ['Playlists', 'Albums', 'Artists', 'Downloads'];

const PLAYLISTS = [
  { name: 'My Afrobeats Mix', tracks: 12, emoji: '🎵', colors: ['#7c3aed','#1a0040'] as [string,string] },
  { name: 'Late Night Vibes', tracks: 8, emoji: '🌙', colors: ['#f97316','#401a00'] as [string,string] },
  { name: 'Workout Hits', tracks: 24, emoji: '💪', colors: ['#22c55e','#003a10'] as [string,string] },
  { name: 'Chill Sunday', tracks: 6, emoji: '☕', colors: ['#ec4899','#3a001a'] as [string,string] },
];

const LIKED = [
  { title: 'Essence', artist: 'Wizkid ft. Tems', duration: '3:48', emoji: '🌙' },
  { title: 'Calm Down', artist: 'Rema', duration: '3:57', emoji: '🎵' },
  { title: 'Last Last', artist: 'Burna Boy', duration: '3:27', emoji: '🔥' },
];

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>My Library</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll} contentContainerStyle={styles.tabRow}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={t} onPress={() => setActiveTab(i)} style={[styles.tab, activeTab === i && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 0 && (
          <>
            {/* Liked Songs shortcut */}
            <TouchableOpacity style={styles.likedRow} activeOpacity={0.85}>
              <LinearGradient colors={['#7c3aed','#f97316']} style={styles.likedIcon}>
                <Text style={{ fontSize: 22 }}>♥</Text>
              </LinearGradient>
              <View style={styles.likedInfo}>
                <Text style={styles.likedTitle}>Liked Songs</Text>
                <Text style={styles.likedSub}>{LIKED.length} tracks</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            {PLAYLISTS.map(p => (
              <TouchableOpacity key={p.name} style={styles.playlistRow} activeOpacity={0.85}>
                <LinearGradient colors={p.colors} style={styles.playlistIcon}>
                  <Text style={{ fontSize: 22 }}>{p.emoji}</Text>
                </LinearGradient>
                <View style={styles.playlistInfo}>
                  <Text style={styles.playlistName}>{p.name}</Text>
                  <Text style={styles.playlistSub}>{p.tracks} tracks</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {activeTab !== 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>No {TABS[activeTab].toLowerCase()} yet</Text>
            <Text style={styles.emptySub}>Start streaming to build your library</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, marginBottom: 14 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, fontFamily: 'Syne-ExtraBold' },
  addBtn: { backgroundColor: 'rgba(124,58,237,0.15)', borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  addBtnText: { fontSize: 13, color: COLORS.purpleLight, fontFamily: 'SpaceGrotesk-Medium' },
  tabScroll: { marginBottom: 16 },
  tabRow: { gap: 8, paddingRight: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1e1e2e', borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: 'rgba(124,58,237,0.25)', borderColor: 'rgba(124,58,237,0.5)' },
  tabText: { fontSize: 13, color: COLORS.textSub, fontFamily: 'SpaceGrotesk-Regular' },
  tabTextActive: { color: COLORS.purpleLight, fontFamily: 'SpaceGrotesk-Medium' },
  likedRow: { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8, gap: 12 },
  likedIcon: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  likedInfo: { flex: 1 },
  likedTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, fontFamily: 'SpaceGrotesk-SemiBold' },
  likedSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2, fontFamily: 'SpaceGrotesk-Regular' },
  arrow: { fontSize: 22, color: COLORS.textMuted },
  playlistRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8, gap: 12 },
  playlistIcon: { width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  playlistInfo: { flex: 1 },
  playlistName: { fontSize: 14, fontWeight: '500', color: COLORS.text, fontFamily: 'SpaceGrotesk-Medium' },
  playlistSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 1, fontFamily: 'SpaceGrotesk-Regular' },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text, fontFamily: 'Syne-Bold', marginBottom: 6 },
  emptySub: { fontSize: 14, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular' },
});
