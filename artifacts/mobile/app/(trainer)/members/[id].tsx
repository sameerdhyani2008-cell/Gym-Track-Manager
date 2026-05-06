import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';

export default function TrainerMemberDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { gym } = useAuth();

  const member = useMemo(() => gym?.members.find(m => m.id === id), [gym, id]);
  const plan = useMemo(() => gym?.plans.find(p => p.id === member?.planId), [gym, member]);

  if (!member) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <Text style={{ color: colors.mutedForeground }}>Member not found</Text>
    </View>
  );

  const markedDates = Object.fromEntries(
    member.attendanceDates.map(d => [d, { marked: true, dotColor: colors.navAttendance }])
  );

  const statusColor = member.status === 'active' ? '#22c55e' : '#f59e0b';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        {member.photo ? (
          <Image source={{ uri: member.photo }} style={[styles.avatar, { borderRadius: 44 }]} />
        ) : (
          <View style={[styles.avatar, { borderRadius: 44, backgroundColor: colors.primary + '33', alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: colors.primary, fontSize: 32, fontFamily: 'Inter_700Bold' }}>{member.name[0]}</Text>
          </View>
        )}
        <Text style={[styles.name, { color: colors.foreground }]}>{member.name}</Text>
        <View style={[styles.badge, { backgroundColor: statusColor + '22', borderRadius: 8 }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{member.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Row label="Phone" value={member.phone} colors={colors} />
        {member.email ? <Row label="Email" value={member.email} colors={colors} /> : null}
        <Row label="Plan" value={plan?.name ?? 'Unknown'} colors={colors} />
        <Row label="Started" value={member.startDate} colors={colors} />
        <Row label="Expires" value={member.endDate} colors={colors} />
        <Row label="Attendance" value={`${member.attendanceDates.length} days`} colors={colors} accent={colors.navAttendance} />
      </View>

      {member.medicalInfo ? (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Medical Info</Text>
          <Text style={[styles.medText, { color: colors.mutedForeground }]}>{member.medicalInfo}</Text>
        </View>
      ) : null}

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Attendance Calendar</Text>
        <Calendar
          markedDates={markedDates}
          theme={{
            backgroundColor: colors.card,
            calendarBackground: colors.card,
            textSectionTitleColor: colors.mutedForeground,
            todayTextColor: colors.primary,
            dayTextColor: colors.foreground,
            textDisabledColor: colors.mutedForeground,
            arrowColor: colors.primary,
            monthTextColor: colors.foreground,
            textMonthFontFamily: 'Inter_600SemiBold',
            textDayFontFamily: 'Inter_400Regular',
            textDayHeaderFontFamily: 'Inter_500Medium',
          }}
        />
      </View>
    </ScrollView>
  );
}

function Row({ label, value, colors, accent }: { label: string; value: string; colors: ReturnType<typeof useColors>; accent?: string }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: accent ?? colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  header: { alignItems: 'center', gap: 10 },
  avatar: { width: 88, height: 88 },
  name: { fontSize: 22, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  badge: { paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  card: { padding: 16, borderWidth: 1, gap: 12 },
  cardTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  medText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  rowValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
});
