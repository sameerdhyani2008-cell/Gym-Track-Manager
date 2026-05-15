import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { GradientBackground } from '@/components/GradientBackground';
import { StatCard } from '@/components/StatCard';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { getExpiringMembers, getFootfall, getMonthRevenue, getTodayDateStr } from '@/store';

const { width } = Dimensions.get('window');

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

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

  const attendancePct = activeMembers.length > 0
    ? Math.round((presentToday / activeMembers.length) * 100)
    : 0;

  const chartData = {
    labels: footfall.filter((_, i) => i % 5 === 0).map(d => d.date.slice(5)),
    datasets: [{ data: footfall.map(d => d.count), strokeWidth: 2 }],
  };

  return (
    <GradientBackground>
    <ScrollView
      style={{ flex: 1, backgroundColor: 'transparent' }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Greeting header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{getGreeting()} 👋</Text>
          <Text style={[styles.gymName, { color: colors.foreground }]}>{gym.name}</Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <View style={[styles.planChip, { backgroundColor: gym.plan === 'pro' ? '#f59e0b22' : colors.card, borderColor: gym.plan === 'pro' ? '#f59e0b55' : colors.border, borderRadius: 20 }]}>
          <Text style={[styles.planChipText, { color: gym.plan === 'pro' ? '#f59e0b' : colors.mutedForeground }]}>
            {gym.plan === 'pro' ? '⭐ Pro' : 'Free'}
          </Text>
        </View>
      </View>

      {/* Stat cards — all tappable */}
      <View style={styles.statsRow}>
        <StatCard
          label="Active Members"
          value={activeMembers.length}
          accent={colors.navDashboard}
          icon="people"
          onPress={() => router.push('/(owner)/members')}
        />
        <StatCard
          label="Present Today"
          value={presentToday}
          accent={colors.navAttendance}
          icon="checkmark-circle"
          sub={activeMembers.length > 0 ? `${attendancePct}% attendance` : undefined}
          onPress={() => router.push('/(owner)/attendance')}
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          label="Expiring (7 days)"
          value={expiring.length}
          accent={expiring.length > 0 ? '#f59e0b' : colors.foreground}
          icon="time"
          onPress={() => router.push('/(owner)/members')}
        />
        <StatCard
          label="Revenue (Month)"
          value={`₹${revenue.toLocaleString()}`}
          accent={colors.navRevenue}
          icon="cash"
          onPress={() => router.push('/(owner)/revenue')}
        />
      </View>

      {/* Quick Actions */}
      <View style={[styles.quickActionsCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <View style={styles.quickRow}>
          {[
            { label: 'Add Member', icon: 'person-add' as const, color: colors.navMembers, route: '/(owner)/members/new' },
            { label: 'Attendance', icon: 'checkmark-done' as const, color: colors.navAttendance, route: '/(owner)/attendance' },
            { label: 'Revenue', icon: 'cash-outline' as const, color: colors.navRevenue, route: '/(owner)/revenue' },
            { label: 'Trainers', icon: 'barbell-outline' as const, color: colors.navTrainers, route: '/(owner)/trainers' },
          ].map(a => (
            <TouchableOpacity
              key={a.route}
              onPress={() => router.push(a.route as any)}
              activeOpacity={0.7}
              style={styles.quickBtn}
            >
              <View style={[styles.quickIcon, { backgroundColor: a.color + '22', borderRadius: 14 }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.mutedForeground }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Expiring Soon */}
      {expiring.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={16} color="#f59e0b" />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Expiring Soon</Text>
          </View>
          {expiring.slice(0, 5).map((m, i) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => router.push(`/(owner)/members/${m.id}` as any)}
              activeOpacity={0.7}
              style={[styles.expiringRow, { borderBottomColor: colors.border, borderBottomWidth: i < Math.min(expiring.length, 5) - 1 ? StyleSheet.hairlineWidth : 0 }]}
            >
              <View style={[styles.expiringAvatar, { backgroundColor: '#f59e0b22', borderRadius: 16 }]}>
                <Text style={{ color: '#f59e0b', fontFamily: 'Inter_700Bold', fontSize: 13 }}>{m.name[0]?.toUpperCase()}</Text>
              </View>
              <Text style={[styles.expiringName, { color: colors.foreground, flex: 1 }]}>{m.name}</Text>
              <Text style={[styles.expiringDate, { color: '#f59e0b' }]}>{m.endDate}</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Footfall chart (Pro) */}
      {gym.plan === 'pro' && (
        <View style={[styles.section, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="analytics" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>30-Day Footfall</Text>
          </View>
          <LineChart
            data={chartData}
            width={Platform.OS === 'web' ? Math.min(width - 64, 500) : width - 64}
            height={160}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: 'transparent',
              backgroundGradientTo: 'transparent',
              backgroundGradientFromOpacity: 0,
              backgroundGradientToOpacity: 0,
              decimalPlaces: 0,
              color: () => colors.primary,
              labelColor: () => colors.mutedForeground,
              propsForDots: { r: '3', strokeWidth: '1', stroke: colors.primary },
            }}
            bezier
            style={{ borderRadius: 12, marginLeft: -16 }}
            withShadow={false}
            withInnerLines={false}
            withOuterLines={false}
          />
        </View>
      )}

      {/* Upgrade to Pro prompt */}
      {gym.plan === 'free' && (
        <TouchableOpacity
          onPress={() => router.push('/(owner)/subscription')}
          style={[styles.proCard, { backgroundColor: colors.primary + '11', borderRadius: colors.radius, borderColor: colors.primary + '33' }]}
          activeOpacity={0.8}
        >
          <View style={styles.proHeader}>
            <View style={[styles.proIconWrap, { backgroundColor: colors.primary + '22', borderRadius: 10 }]}>
              <Ionicons name="star" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.proTitle, { color: colors.primary }]}>Unlock Pro Features</Text>
              <Text style={[styles.proSub, { color: colors.mutedForeground }]}>
                Analytics, advanced reports & more — ₹99/month
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 4 },
  greeting: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  gymName: { fontSize: 22, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  date: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  planChip: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, marginTop: 4 },
  planChipText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  statsRow: { flexDirection: 'row', gap: 12 },
  quickActionsCard: { padding: 16, borderWidth: 1, gap: 14 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickBtn: { alignItems: 'center', gap: 6, flex: 1 },
  quickIcon: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  section: { padding: 16, borderWidth: 1, gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  expiringRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  expiringAvatar: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  expiringName: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  expiringDate: { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  proCard: { padding: 16, borderWidth: 1 },
  proHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  proIconWrap: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  proTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  proSub: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
});
