// Mobile Explore Screen
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0a0a0f', card: '#1e1e2e', purple: '#7c3aed',
  purpleLight: '#a855f7', gold: '#f0c040',
  text: '#f0eeff', textSub: '#a89ec0', textMuted: '#6a6080',
  border: 'rgba(124,58,237,0.2)',
};

const GENRES = [
  { name: 'Afrobeats', emoji: '🥁', colors: ['#7c3aed', '#1a0040'] as [string,string] },
  { name: 'Hip-Hop', emoji: '🎤', colors: ['#f97316', '#401a00'] as [string,string] },
  { name: 'R&B / Soul', emoji: '🎶', colors: ['#ec4899', '#3a001a'] as [string,string] },
  { name: 'Highlife', emoji: '🎷', colors: ['#06b6d4', '#003a4a'] as [string,string] },
  { name: 'Gospel', emoji: '✝', colors: ['#f0c040', '#3a2a00'] as [string,string] },
  { name: 'Reggae', emoji: '🌿', colors: ['#22c55e', '#003a10'] as [string,string] },
  { name: 'Amapiano', emoji: '🎹', colors: ['#f97316', '#7c3aed'] as [string,string] },
  { name: 'Afropop', emoji: '🌍', colors: ['#ec4899', '#06b6d4'] as [string,string] },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>Explore</Text>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs, artists, albums..."
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Browse Genres</Text>
        <View style={styles.genreGrid}>
          {GENRES.map(g => (
            <TouchableOpacity key={g.name} style={styles.genreCard} activeOpacity={0.85}>
              <LinearGradient colors={g.colors} style={styles.genreGrad}>
                <Text style={styles.genreEmoji}>{g.emoji}</Text>
                <Text style={styles.genreName}>{g.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>🌍 African Artists to Watch</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {['Asake ⚡', 'Zinoleesky 🍦', 'BNXN 🎵', 'Seun Kuti 🎷', 'Omah Lay 🌙'].map((a, i) => {
            const [name, emoji] = a.split(' ');
            const gradients: [string,string][] = [['#7c3aed','#1a0040'],['#f97316','#401a00'],['#ec4899','#3a001a'],['#06b6d4','#003a4a'],['#22c55e','#003a10']];
            return (
              <TouchableOpacity key={a} style={styles.artistCard} activeOpacity={0.85}>
                <LinearGradient colors={gradients[i]} style={styles.artistAvatar}>
                  <Text style={{ fontSize: 26 }}>{emoji}</Text>
                </LinearGradient>
                <Text style={styles.artistName}>{name}</Text>
                <Text style={styles.artistGenre}>Afrobeats</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, fontFamily: 'Syne-ExtraBold', paddingTop: 8, marginBottom: 14 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1e2e', borderWidth: 1, borderColor: COLORS.border, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 20, gap: 8 },
  searchIcon: { fontSize: 18, color: COLORS.textMuted },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text, fontFamily: 'SpaceGrotesk-Regular' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, fontFamily: 'Syne-Bold', marginBottom: 14 },
  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  genreCard: { width: '47.5%' },
  genreGrad: { borderRadius: 14, padding: 20, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: COLORS.border },
  genreEmoji: { fontSize: 30 },
  genreName: { fontSize: 14, fontWeight: '600', color: 'white', fontFamily: 'SpaceGrotesk-SemiBold' },
  hScroll: { gap: 12, paddingRight: 16, paddingBottom: 4 },
  artistCard: { width: 110, backgroundColor: COLORS.card, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  artistAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  artistName: { fontSize: 12.5, fontWeight: '500', color: COLORS.text, textAlign: 'center', fontFamily: 'SpaceGrotesk-Medium' },
  artistGenre: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontFamily: 'SpaceGrotesk-Regular' },
});
