import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  bg: '#0a0a0f',
  card: '#12121a',
  purple: '#7c3aed',
  purpleLight: '#a855f7',
  gold: '#f0c040',
  textMuted: '#6a6080',
  border: 'rgba(124,58,237,0.2)',
};

function TabIcon({ name, focused, icon }: { name: string; focused: boolean; icon: string }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.5 }]}>{icon}</Text>
      <Text style={[styles.tabLabel, { color: focused ? COLORS.purpleLight : COLORS.textMuted }]}>
        {name}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Home" focused={focused} icon="⌂" /> }}
      />
      <Tabs.Screen
        name="explore"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Explore" focused={focused} icon="⊞" /> }}
      />
      <Tabs.Screen
        name="library"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Library" focused={focused} icon="♪" /> }}
      />
      <Tabs.Screen
        name="wallet"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Wallet" focused={focused} icon="◈" /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="Profile" focused={focused} icon="👤" /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: { alignItems: 'center', justifyContent: 'center', paddingTop: 6 },
  tabEmoji: { fontSize: 22 },
  tabLabel: { fontSize: 10, marginTop: 2, fontFamily: 'SpaceGrotesk-Regular' },
});
