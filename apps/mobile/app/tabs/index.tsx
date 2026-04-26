import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W * 0.42;

const COLORS = {
  bg: '#0a0a0f',
  card: '#1e1e2e',
  purple: '#7c3aed',
  purpleLight: '#a855f7',
  gold: '#f0c040',
  orange: '#f97316',
  text: '#f0eeff',
  textSub: '#a89ec0',
  textMuted: '#6a6080',
  border: 'rgba(124,58,237,0.2)',
  success: '#22c55e',
};

const TRACKS = [
  { id: '1', title: 'Essence', artist: 'Wizkid ft. Tems', emoji: '🌙', gradient: ['#7c3aed','#1a0040'] as [string,string] },
  { id: '2', title: 'Calm Down', artist: 'Rema', emoji: '🎵', gradient: ['#f97316','#401a00'] as [string,string] },
  { id: '3', title: 'Last Last', artist: 'Burna Boy', emoji: '🔥', gradient: ['#ec4899','#3a001a'] as [string,string] },
  { id: '4', title: 'Peru', artist: 'Fireboy DML', emoji: '✨', gradient: ['#06b6d4','#003a4a'] as [string,string] },
];

const ARTISTS = [
  { name: 'Wizkid', emoji: '🌙', followers: '8.2M', gradient: ['#7c3aed','#1a0040'] as [string,string] },
  { name: 'Burna Boy', emoji: '🔥', followers: '6.4M', gradient: ['#f97316','#401a00'] as [string,string] },
  { name: 'Tems', emoji: '✨', followers: '4.1M', gradient: ['#ec4899','#3a001a'] as [string,string] },
  { name: 'Rema', emoji: '🎵', followers: '5.6M', gradient: ['#22c55e','#003a10'] as [string,string] },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good evening 👋</Text>
          <Text style={styles.headerTitle}>What's playing today?</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Text style={{ fontSize: 20 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Earn banner */}
        <LinearGradient
          colors={['rgba(124,58,237,0.3)', 'rgba(249,115,22,0.15)', 'transparent']}
          style={styles.earnBanner}
        >
          <Text style={styles.earnTag}>✦ EARN WHILE YOU LISTEN</Text>
          <Text style={styles.earnTitle}>Earn <Text style={styles.earnHighlight}>NZM tokens</Text>{'\n'}on every stream</Text>
          <Text style={styles.earnSub}>Free: 0.25 NZM · Premium: 0.50 NZM per stream</Text>
          <View style={styles.earnStats}>
            {[{ val: '124K', label: 'Listeners' }, { val: '31K', label: 'NZM Today' }, { val: '8.4K+', label: 'Artists' }].map(s => (
              <View key={s.label} style={styles.earnStat}>
                <Text style={styles.earnStatVal}>{s.val}</Text>
                <Text style={styles.earnStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Trending */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
            <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {TRACKS.map(t => (
              <TouchableOpacity key={t.id} style={styles.trackCard} activeOpacity={0.85}>
                <LinearGradient colors={t.gradient} style={styles.trackCover}>
                  <Text style={styles.trackEmoji}>{t.emoji}</Text>
                  <View style={styles.playOverlay}>
                    <Text style={styles.playBtn}>▶</Text>
                  </View>
                </LinearGradient>
                <Text style={styles.trackTitle} numberOfLines={1}>{t.title}</Text>
                <Text style={styles.trackArtist} numberOfLines={1}>{t.artist}</Text>
                <Text style={styles.trackEarn}>⬡ +0.25 NZM</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Top Artists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Artists</Text>
            <TouchableOpacity><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {ARTISTS.map(a => (
              <TouchableOpacity key={a.name} style={styles.artistCard} activeOpacity={0.85}>
                <LinearGradient colors={a.gradient} style={styles.artistAvatar}>
                  <Text style={{ fontSize: 26 }}>{a.emoji}</Text>
                </LinearGradient>
                <Text style={styles.artistName}>{a.name}</Text>
                <Text style={styles.artistFollowers}>{a.followers}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bottom spacer for player */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  greeting: { fontSize: 12, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, fontFamily: 'Syne-Bold' },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e1e2e', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  scroll: { paddingHorizontal: 16 },
  earnBanner: { borderRadius: 20, padding: 22, marginTop: 16, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  earnTag: { fontSize: 10, color: COLORS.gold, letterSpacing: 1.5, marginBottom: 10, fontFamily: 'SpaceGrotesk-Medium' },
  earnTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, lineHeight: 30, marginBottom: 8, fontFamily: 'Syne-ExtraBold' },
  earnHighlight: { color: COLORS.gold },
  earnSub: { fontSize: 13, color: COLORS.textSub, marginBottom: 16, fontFamily: 'SpaceGrotesk-Regular' },
  earnStats: { flexDirection: 'row', gap: 24 },
  earnStat: {},
  earnStatVal: { fontSize: 16, fontWeight: '700', color: COLORS.gold, fontFamily: 'Syne-Bold' },
  earnStatLabel: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular' },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, fontFamily: 'Syne-Bold' },
  seeAll: { fontSize: 13, color: COLORS.purpleLight, fontFamily: 'SpaceGrotesk-Regular' },
  hScroll: { paddingRight: 16, gap: 12 },
  trackCard: { width: CARD_W, backgroundColor: COLORS.card, borderRadius: 14, padding: 10, borderWidth: 1, borderColor: COLORS.border },
  trackCover: { width: '100%', aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10, position: 'relative' },
  trackEmoji: { fontSize: 36 },
  playOverlay: { position: 'absolute', bottom: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  playBtn: { fontSize: 14, color: 'white' },
  trackTitle: { fontSize: 13, fontWeight: '500', color: COLORS.text, fontFamily: 'SpaceGrotesk-Medium' },
  trackArtist: { fontSize: 11.5, color: COLORS.textSub, marginTop: 2, fontFamily: 'SpaceGrotesk-Regular' },
  trackEarn: { fontSize: 10.5, color: COLORS.gold, marginTop: 5, fontFamily: 'SpaceGrotesk-Medium' },
  artistCard: { width: 120, backgroundColor: COLORS.card, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  artistAvatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  artistName: { fontSize: 12.5, fontWeight: '500', color: COLORS.text, textAlign: 'center', fontFamily: 'SpaceGrotesk-Medium' },
  artistFollowers: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontFamily: 'SpaceGrotesk-Regular' },
});
