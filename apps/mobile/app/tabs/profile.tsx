import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0a0a0f', card: '#1e1e2e', purple: '#7c3aed',
  purpleLight: '#a855f7', gold: '#f0c040', orange: '#f97316',
  text: '#f0eeff', textSub: '#a89ec0', textMuted: '#6a6080',
  border: 'rgba(124,58,237,0.2)', success: '#22c55e',
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const menuItems = [
    { icon: '🎤', label: 'Artist Dashboard', sub: 'Upload music & view analytics', arrow: true },
    { icon: '⭐', label: 'Upgrade to Premium', sub: '2× earnings + HD audio + offline — $1/mo', arrow: true },
    { icon: '◈', label: 'Connect BSC Wallet', sub: 'Link wallet for NZM withdrawals', arrow: true },
    { icon: '🔐', label: 'Privacy & Security', sub: 'Password, biometrics, sessions', arrow: true },
    { icon: '🔔', label: 'Notifications', sub: 'Manage your notification preferences', arrow: true },
    { icon: '🌍', label: 'Language & Region', sub: 'English · Nigeria', arrow: true },
    { icon: '❓', label: 'Help & Support', sub: 'FAQ, contact, report an issue', arrow: true },
    { icon: '⊡', label: 'Account & Data', sub: 'Download or delete your account', arrow: true },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={['rgba(124,58,237,0.2)', 'transparent']}
          style={styles.profileHeader}
        >
          <View style={styles.avatarContainer}>
            <LinearGradient colors={['#7c3aed', '#f97316']} style={styles.avatar}>
              <Text style={styles.avatarText}>DD</Text>
            </LinearGradient>
            <View style={styles.verifiedBadge}>
              <Text style={{ fontSize: 12 }}>✓</Text>
            </View>
          </View>
          <Text style={styles.name}>Dinfa Dashe</Text>
          <Text style={styles.username}>@web3tribe</Text>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>FREE TIER</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.3)' }]}>
              <Text style={[styles.badgeText, { color: COLORS.success }]}>✓ KYC Verified</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            {[
              { label: 'NZM Balance', val: '1,247.50', color: COLORS.gold },
              { label: 'Total Streams', val: '4,832', color: COLORS.purpleLight },
              { label: 'Following', val: '12', color: COLORS.text },
            ].map(s => (
              <View key={s.label} style={styles.profileStat}>
                <Text style={[styles.profileStatVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.profileStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Menu */}
        <View style={styles.menuCard}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuItem, i < menuItems.length - 1 && styles.menuBorder]}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.sub}</Text>
              </View>
              {item.arrow && <Text style={styles.menuArrow}>›</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>NzemFi v1.0.0 · Stream. Support. Earn.</Text>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  profileHeader: { alignItems: 'center', padding: 24, paddingBottom: 28 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '700', color: 'white', fontFamily: 'Syne-Bold' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.purpleLight, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.bg },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text, fontFamily: 'Syne-ExtraBold', marginBottom: 2 },
  username: { fontSize: 14, color: COLORS.textSub, fontFamily: 'SpaceGrotesk-Regular', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  badge: { backgroundColor: 'rgba(124,58,237,0.15)', borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, color: COLORS.purpleLight, fontFamily: 'SpaceGrotesk-Medium' },
  statsRow: { flexDirection: 'row', gap: 24 },
  profileStat: { alignItems: 'center' },
  profileStatVal: { fontSize: 18, fontWeight: '700', fontFamily: 'Syne-Bold' },
  profileStatLabel: { fontSize: 11, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular', marginTop: 2 },
  menuCard: { backgroundColor: COLORS.card, borderRadius: 16, marginHorizontal: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 12 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcon: { fontSize: 22, width: 30, textAlign: 'center' },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '500', color: COLORS.text, fontFamily: 'SpaceGrotesk-Medium' },
  menuSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 1, fontFamily: 'SpaceGrotesk-Regular' },
  menuArrow: { fontSize: 22, color: COLORS.textMuted },
  signOutBtn: { marginHorizontal: 16, marginBottom: 12, backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: 14, padding: 14, alignItems: 'center' },
  signOutText: { fontSize: 15, color: '#ef4444', fontWeight: '600', fontFamily: 'SpaceGrotesk-SemiBold' },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular', marginBottom: 8 },
});
