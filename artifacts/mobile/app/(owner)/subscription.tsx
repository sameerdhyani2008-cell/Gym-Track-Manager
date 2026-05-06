import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';

const PRO_FEATURES = [
  'Footfall chart (30-day analytics)',
  'Previous members list',
  'Advanced revenue reports',
  'Unlimited trainer accounts',
  'Priority support',
];

const FREE_FEATURES = [
  'Up to 100 active members',
  'Daily attendance tracking',
  'Revenue management',
  '1 trainer account',
  'Membership plans',
];

export default function SubscriptionScreen() {
  const colors = useColors();
  const { gym } = useAuth();
  const isPro = gym?.plan === 'pro';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.foreground }]}>Your Plan</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground }]}>Manage your gym subscription</Text>

      <View style={[styles.currentBadge, { backgroundColor: isPro ? '#f59e0b22' : colors.card, borderColor: isPro ? '#f59e0b44' : colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.currentLabel, { color: colors.mutedForeground }]}>Current Plan</Text>
        <Text style={[styles.currentPlan, { color: isPro ? '#f59e0b' : colors.foreground }]}>
          {isPro ? 'Pro' : 'Free'}
        </Text>
      </View>

      <View style={styles.tiers}>
        <TierCard
          title="Free"
          price="₹0"
          period="forever"
          features={FREE_FEATURES}
          active={!isPro}
          colors={colors}
          accentColor={colors.mutedForeground}
        />
        <TierCard
          title="Pro"
          price="₹999"
          period="/ month"
          features={PRO_FEATURES}
          active={isPro}
          colors={colors}
          accentColor="#f59e0b"
          highlighted
        />
      </View>

      {!isPro && (
        <View style={[styles.upgradeBox, { backgroundColor: colors.primary + '11', borderColor: colors.primary + '33', borderRadius: colors.radius }]}>
          <Text style={[styles.upgradeTitle, { color: colors.primary }]}>Upgrade to Pro</Text>
          <Text style={[styles.upgradeSub, { color: colors.mutedForeground }]}>
            Contact us at support@thetrack.app to upgrade your gym to Pro and unlock all features.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function TierCard({ title, price, period, features, active, colors, accentColor, highlighted }: {
  title: string; price: string; period: string; features: string[]; active: boolean;
  colors: ReturnType<typeof useColors>; accentColor: string; highlighted?: boolean;
}) {
  return (
    <View style={[
      styles.tier,
      {
        backgroundColor: highlighted ? accentColor + '11' : colors.card,
        borderColor: active ? accentColor : colors.border,
        borderWidth: active ? 2 : 1,
        borderRadius: colors.radius,
      },
    ]}>
      {active && (
        <View style={[styles.activeBadge, { backgroundColor: accentColor, borderRadius: 6 }]}>
          <Text style={styles.activeBadgeText}>Current</Text>
        </View>
      )}
      <Text style={[styles.tierTitle, { color: colors.foreground }]}>{title}</Text>
      <View style={styles.priceRow}>
        <Text style={[styles.tierPrice, { color: accentColor }]}>{price}</Text>
        <Text style={[styles.tierPeriod, { color: colors.mutedForeground }]}>{period}</Text>
      </View>
      <View style={styles.featureList}>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={16} color={accentColor} />
            <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{f}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  currentBadge: { padding: 16, borderWidth: 1, gap: 4 },
  currentLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  currentPlan: { fontSize: 28, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  tiers: { gap: 16 },
  tier: { padding: 20, gap: 12 },
  activeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4 },
  activeBadgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const, color: '#fff' },
  tierTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  tierPrice: { fontSize: 28, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  tierPeriod: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  featureList: { gap: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 14, fontFamily: 'Inter_400Regular', flex: 1 },
  upgradeBox: { padding: 16, borderWidth: 1, gap: 8 },
  upgradeTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  upgradeSub: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
});
