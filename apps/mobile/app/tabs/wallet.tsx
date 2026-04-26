import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0a0a0f', card: '#1e1e2e', purple: '#7c3aed',
  purpleLight: '#a855f7', gold: '#f0c040', orange: '#f97316',
  text: '#f0eeff', textSub: '#a89ec0', textMuted: '#6a6080',
  border: 'rgba(124,58,237,0.2)', success: '#22c55e', error: '#ef4444',
};

const TRANSACTIONS = [
  { id: '1', icon: '🎵', type: 'Stream Earnings', sub: '51 tracks · Today', amount: '+12.75', positive: true },
  { id: '2', icon: '👥', type: 'Referral Bonus', sub: 'Friend joined NzemFi', amount: '+50.00', positive: true },
  { id: '3', icon: '↑', type: 'Withdrawal', sub: 'To BEP20 ...3e3e', amount: '-100.00', positive: false },
  { id: '4', icon: '🎵', type: 'Stream Earnings', sub: '48 tracks · Yesterday', amount: '+12.00', positive: true },
  { id: '5', icon: '🎤', type: 'Artist Royalty', sub: 'Track: Essence', amount: '+3.50', positive: true },
];

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const balance = 1247.50;

  const handleWithdraw = () => {
    Alert.alert(
      'Withdraw NZM',
      'Enter your BEP-20 wallet address and amount to withdraw. Minimum 100 NZM. 5% fee applies.',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Continue', onPress: () => {} }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>Wallet</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <LinearGradient
          colors={['rgba(124,58,237,0.35)', 'rgba(249,115,22,0.18)', 'rgba(10,10,15,0)']}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>NZM TOKEN BALANCE</Text>
          <Text style={styles.balanceAmount}>{balance.toFixed(2)}</Text>
          <Text style={styles.balanceUsd}>≈ ${(balance * 0.01).toFixed(2)} USD  ·  1 NZM = $0.01</Text>

          <View style={styles.actionRow}>
            {[
              { label: 'Withdraw', icon: '↑', action: handleWithdraw },
              { label: 'Swap', icon: '⇄', action: () => {} },
              { label: 'Add Funds', icon: '+', action: () => {} },
            ].map(b => (
              <TouchableOpacity key={b.label} onPress={b.action} style={styles.actionBtn} activeOpacity={0.8}>
                <Text style={styles.actionIcon}>{b.icon}</Text>
                <Text style={styles.actionLabel}>{b.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Today', val: '12.75', unit: 'NZM' },
            { label: 'This Month', val: '342.00', unit: 'NZM' },
            { label: 'All Time', val: '1,247.50', unit: 'NZM' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statVal}>{s.val}</Text>
              <Text style={styles.statUnit}>{s.unit}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Earn Rate Banner */}
        <View style={styles.earnRateBanner}>
          <Text style={styles.earnRateText}>Your earn rate: <Text style={{ color: COLORS.gold, fontWeight: '700' }}>0.25 NZM/stream</Text></Text>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>⭐ 2× for $1/mo</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions */}
        <Text style={styles.sectionTitle}>Transaction History</Text>
        <View style={styles.txCard}>
          {TRANSACTIONS.map((tx, i) => (
            <View key={tx.id} style={[styles.txItem, i < TRANSACTIONS.length - 1 && styles.txBorder]}>
              <View style={[styles.txIcon, { backgroundColor: tx.positive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }]}>
                <Text style={{ fontSize: 18 }}>{tx.icon}</Text>
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txType}>{tx.type}</Text>
                <Text style={styles.txSub}>{tx.sub}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.positive ? COLORS.success : COLORS.error }]}>
                {tx.amount} NZM
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingHorizontal: 16 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, fontFamily: 'Syne-ExtraBold', marginBottom: 16, paddingTop: 8 },
  balanceCard: { borderRadius: 20, padding: 24, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  balanceLabel: { fontSize: 11, color: COLORS.textMuted, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'SpaceGrotesk-Regular', marginBottom: 8 },
  balanceAmount: { fontSize: 52, fontWeight: '800', color: COLORS.gold, fontFamily: 'Syne-ExtraBold', lineHeight: 58 },
  balanceUsd: { fontSize: 13, color: COLORS.textSub, marginTop: 6, marginBottom: 20, fontFamily: 'SpaceGrotesk-Regular' },
  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 18, color: COLORS.text },
  actionLabel: { fontSize: 12, color: COLORS.textSub, fontFamily: 'SpaceGrotesk-Regular' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 18, fontWeight: '700', color: COLORS.gold, fontFamily: 'Syne-Bold' },
  statUnit: { fontSize: 10, color: COLORS.textMuted, fontFamily: 'SpaceGrotesk-Regular' },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, fontFamily: 'SpaceGrotesk-Regular' },
  earnRateBanner: { backgroundColor: 'rgba(240,192,64,0.08)', borderWidth: 1, borderColor: 'rgba(240,192,64,0.2)', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 },
  earnRateText: { fontSize: 13, color: COLORS.textSub, fontFamily: 'SpaceGrotesk-Regular', flex: 1 },
  upgradeBtn: { backgroundColor: 'rgba(240,192,64,0.15)', borderWidth: 1, borderColor: 'rgba(240,192,64,0.3)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  upgradeBtnText: { fontSize: 12, color: COLORS.gold, fontFamily: 'SpaceGrotesk-Medium' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, fontFamily: 'Syne-Bold', marginBottom: 12 },
  txCard: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  txItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  txBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  txIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  txInfo: { flex: 1 },
  txType: { fontSize: 14, fontWeight: '500', color: COLORS.text, fontFamily: 'SpaceGrotesk-Medium' },
  txSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 1, fontFamily: 'SpaceGrotesk-Regular' },
  txAmount: { fontSize: 13.5, fontWeight: '600', fontFamily: 'SpaceGrotesk-SemiBold' },
});
