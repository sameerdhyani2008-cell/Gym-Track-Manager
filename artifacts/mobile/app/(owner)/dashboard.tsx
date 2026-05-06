import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { StatCard } from '@/components/StatCard';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { getExpiringMembers, getFootfall, getMonthRevenue, getTodayDateStr } from '@/store';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const colors = useColors();
  const { gym, refreshGym } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshGym();
    setRefreshing(false);
  }, [refreshGym]);

  if (!gym) return null;

  const today = getTodayDateStr();
  const activeMembers = gym.members.filter(m => m.status === 'active');
  const presentToday = activeMembers.filter(m => m.attendanceDates.includes(today)).length;
  const expiring = getExpiringMembers(gym);
  const revenue = getMonthRevenue(gym);
  const footfall = getFootfall(gym);

  const chartData = {
    labels: footfall.filter((_, i) => i % 5 === 0).map(d => d.date.slice(5)),
    datasets: [{ data: footfall.map(d => d.count), strokeWidth: 2 }],
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* The Track Logo */}
      <View style={styles.logoRow}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.logoIcon}
          resizeMode="contain"
        />
        <View>
          <Text style={[styles.logoText, { color: colors.primary }]}>The Track</Text>
          <Text style={[styles.logoSub, { color: colors.mutedForeground }]}>Gym Manager</Text>
        </View>
      </View>

      <View style={styles.header}>
        <Text style={[styles.gymName, { color: colors.foreground }]}>{gym.name}</Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <StatCard label="Active Members" value={activeMembers.length} accent={colors.navDashboard} />
        <StatCard label="Present Today" value={presentToday} accent={colors.navAttendance} />
      </View>
      <View style={styles.statsRow}>
        <StatCard label="Expiring (7 days)" value={expiring.length} accent={expiring.length > 0 ? '#f59e0b' : colors.foreground} />
        <StatCard label="Revenue (Month)" value={`₹${revenue.toLocaleString()}`} accent={colors.navRevenue} />
      </View>

      {gym.plan === 'pro' && (
        <View style={[styles.chart, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>30-Day Footfall</Text>
          <LineChart
            data={chartData}
            width={Platform.OS === 'web' ? Math.min(width - 64, 500) : width - 64}
            height={180}
            chartConfig={{
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: () => colors.primary,
              labelColor: () => colors.mutedForeground,
              style: { borderRadius: 12 },
              propsForDots: { r: '3', strokeWidth: '1', stroke: colors.primary },
            }}
            bezier
            style={{ borderRadius: 12 }}
            withShadow={false}
            withInnerLines={false}
            withOuterLines={false}
          />
        </View>
      )}

      {gym.plan === 'free' && (
        <TouchableOpacity
          onPress={() => router.push('/(owner)/subscription')}
          style={[styles.proCard, { backgroundColor: colors.primary + '11', borderRadius: colors.radius, borderColor: colors.primary + '33' }]}
          activeOpacity={0.8}
        >
          <View style={styles.proHeader}>
            <Ionicons name="star" size={18} color={colors.primary} />
            <Text style={[styles.proTitle, { color: colors.primary }]}>Unlock Pro Features</Text>
          </View>
          <Text style={[styles.proSub, { color: colors.mutedForeground }]}>
            Footfall analytics, previous members, advanced reports — ₹99/month
          </Text>
          <Text style={[styles.proLink, { color: colors.primary }]}>View plans →</Text>
        </TouchableOpacity>
      )}

      {expiring.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Expiring Soon</Text>
          {expiring.slice(0, 3).map(m => (
            <View key={m.id} style={[styles.expiringRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.expiringName, { color: colors.foreground }]}>{m.name}</Text>
              <Text style={[styles.expiringDate, { color: '#f59e0b' }]}>{m.endDate}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  logoIcon: { width: 36, height: 36, borderRadius: 8 },
  logoText: { fontSize: 18, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, letterSpacing: 0.3 },
  logoSub: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  header: { gap: 2, marginBottom: 4 },
  gymName: { fontSize: 22, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  date: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  statsRow: { flexDirection: 'row', gap: 12 },
  chart: { padding: 16, borderWidth: 1, gap: 12 },
  chartTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  proCard: { padding: 16, borderWidth: 1, gap: 8 },
  proHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  proTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  proSub: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  proLink: { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  section: { padding: 16, borderWidth: 1, gap: 12 },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  expiringRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  expiringName: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  expiringDate: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
});
