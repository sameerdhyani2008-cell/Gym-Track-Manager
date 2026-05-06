import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
  subtitle?: string;
}

export default function MoreScreen() {
  const colors = useColors();
  const router = useRouter();
  const { gym } = useAuth();

  const items: MenuItem[] = [
    {
      label: 'Trainers',
      icon: 'person-outline',
      color: colors.navTrainers,
      route: '/(owner)/trainers',
      subtitle: `${gym?.trainers?.length ?? 0} trainer${(gym?.trainers?.length ?? 0) !== 1 ? 's' : ''}`,
    },
    {
      label: 'Plans',
      icon: 'pricetag-outline',
      color: colors.primary,
      route: '/(owner)/plans',
      subtitle: `${gym?.plans?.length ?? 0} active plan${(gym?.plans?.length ?? 0) !== 1 ? 's' : ''}`,
    },
    {
      label: 'Settings',
      icon: 'settings-outline',
      color: colors.navSettings,
      route: '/(owner)/settings',
      subtitle: 'Gym profile & dark mode',
    },
    {
      label: 'Subscription',
      icon: 'star-outline',
      color: colors.navSubscription,
      route: '/(owner)/subscription',
      subtitle: gym?.plan === 'pro' ? 'Pro Plan' : 'Free Plan — Tap to upgrade',
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.heading, { color: colors.foreground }]}>More</Text>
      {items.map(item => (
        <TouchableOpacity
          key={item.route}
          onPress={() => router.push(item.route as any)}
          activeOpacity={0.75}
          style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
        >
          <View style={[styles.iconWrap, { backgroundColor: item.color + '22', borderRadius: 10 }]}>
            <Ionicons name={item.icon} size={22} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.foreground }]}>{item.label}</Text>
            {item.subtitle ? <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{item.subtitle}</Text> : null}
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 10, paddingBottom: 40 },
  heading: { fontSize: 22, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderWidth: 1 },
  iconWrap: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  subtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
});
