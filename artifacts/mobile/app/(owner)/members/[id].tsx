import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { StyledButton } from '@/components/StyledButton';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { updateMember } from '@/store';

export default function MemberDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { gym, session, refreshGym } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'extend' | 'cancel' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const member = useMemo(() => gym?.members.find(m => m.id === id), [gym, id]);
  const plan = useMemo(() => gym?.plans.find(p => p.id === member?.planId), [gym, member]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshGym();
    setRefreshing(false);
  }, [refreshGym]);

  if (!member) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <Text style={{ color: colors.mutedForeground }}>Member not found</Text>
    </View>
  );

  const markedDates = Object.fromEntries(
    member.attendanceDates.map(d => [d, { marked: true, dotColor: colors.navAttendance }])
  );

  const today = new Date();
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [ey, em, ed] = member.endDate.split('-').map(Number);
  const endLocal = new Date(ey, em - 1, ed);
  const daysLeft = Math.round((endLocal.getTime() - todayLocal.getTime()) / 86400000);
  const statusColor = member.status === 'active' ? '#22c55e' : member.status === 'expired' ? '#f59e0b' : '#ef4444';

  const handleConfirm = async () => {
    if (!session?.gymId || !confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction === 'extend' && plan) {
        const newEnd = new Date(member.endDate);
        newEnd.setMonth(newEnd.getMonth() + plan.duration);
        await updateMember(session.gymId, member.id, {
          endDate: newEnd.toISOString().slice(0, 10),
          status: 'active',
        });
        await refreshGym();
        setConfirmAction(null);
      } else if (confirmAction === 'cancel') {
        await updateMember(session.gymId, member.id, { status: 'cancelled' });
        await refreshGym();
        router.back();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const hasMedical = member.medicalConditions || member.previousInjuries || member.bloodType || member.allergies || member.medicalInfo;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.header}>
        {member.photo ? (
          <Image source={{ uri: member.photo }} style={[styles.avatar, { borderRadius: 44 }]} />
        ) : (
          <View style={[styles.avatar, { borderRadius: 44, backgroundColor: colors.primary + '33', alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: colors.primary, fontSize: 32, fontFamily: 'Inter_700Bold' }}>{member.name[0]}</Text>
          </View>
        )}
        <Text style={[styles.name, { color: colors.foreground }]}>{member.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderRadius: 8 }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{member.status.toUpperCase()}</Text>
        </View>
      </View>

      {/* Basic Info */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Row label="Phone" value={member.phone} colors={colors} />
        {member.email ? <Row label="Email" value={member.email} colors={colors} /> : null}
        {member.dateOfBirth ? <Row label="Date of Birth" value={member.dateOfBirth} colors={colors} /> : null}
        <Row label="Plan" value={plan?.name ?? 'Unknown'} colors={colors} />
        <Row label="Started" value={member.startDate} colors={colors} />
        <Row label="Expires" value={member.endDate} colors={colors} accent={daysLeft < 7 ? '#f59e0b' : undefined} />
        {member.status === 'active' && (
          <Row label="Days Left" value={daysLeft > 0 ? `${daysLeft} days` : 'Expired'} colors={colors} accent={daysLeft < 7 ? '#f59e0b' : '#22c55e'} />
        )}
        <Row label="Attendance" value={`${member.attendanceDates.length} days`} colors={colors} accent={colors.navAttendance} />
        <Row label="Paid" value={`₹${member.amountPaid.toLocaleString()}`} colors={colors} />
        <Row label="Payment" value={member.paymentMethod.toUpperCase()} colors={colors} />
      </View>

      {/* Medical */}
      {hasMedical && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <View style={styles.medHeader}>
            <Ionicons name="medical-outline" size={16} color="#ef4444" />
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Medical Details</Text>
          </View>
          {member.bloodType ? <Row label="Blood Type" value={member.bloodType} colors={colors} accent="#ef4444" /> : null}
          {member.medicalConditions ? (
            <MedBlock label="Conditions" value={member.medicalConditions} colors={colors} />
          ) : null}
          {member.previousInjuries ? (
            <MedBlock label="Previous Injuries" value={member.previousInjuries} colors={colors} />
          ) : null}
          {member.allergies ? (
            <MedBlock label="Allergies" value={member.allergies} colors={colors} />
          ) : null}
          {/* Legacy fallback */}
          {member.medicalInfo && !member.medicalConditions && !member.previousInjuries ? (
            <MedBlock label="Medical Info" value={member.medicalInfo} colors={colors} />
          ) : null}
        </View>
      )}

      {/* Calendar */}
      <View style={[styles.calendarCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Attendance Calendar</Text>
        <Calendar
          markedDates={markedDates}
          theme={{
            backgroundColor: colors.card,
            calendarBackground: colors.card,
            textSectionTitleColor: colors.mutedForeground,
            selectedDayBackgroundColor: colors.primary,
            selectedDayTextColor: '#fff',
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

      {/* Actions */}
      {member.status === 'active' && !confirmAction && (
        <View style={styles.actions}>
          <StyledButton title="Extend Membership" onPress={() => setConfirmAction('extend')} style={{ flex: 1 }} />
          <StyledButton title="Cancel" onPress={() => setConfirmAction('cancel')} variant="destructive" style={{ flex: 1 }} />
        </View>
      )}

      {confirmAction === 'extend' && plan && (
        <View style={[styles.confirmBox, { backgroundColor: colors.primary + '11', borderColor: colors.primary + '44', borderRadius: colors.radius }]}>
          <Text style={[styles.confirmTitle, { color: colors.foreground }]}>Extend membership?</Text>
          <Text style={[styles.confirmSub, { color: colors.mutedForeground }]}>
            Add {plan.duration} month{plan.duration > 1 ? 's' : ''} to {member.name}'s membership.
          </Text>
          <View style={styles.confirmBtns}>
            <TouchableOpacity onPress={() => setConfirmAction(null)} style={[styles.confirmNo, { borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} disabled={actionLoading} style={[styles.confirmYes, { backgroundColor: colors.primary, borderRadius: colors.radius }]}>
              <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold' }}>{actionLoading ? 'Extending...' : 'Extend'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {confirmAction === 'cancel' && (
        <View style={[styles.confirmBox, { backgroundColor: '#ef444411', borderColor: '#ef444444', borderRadius: colors.radius }]}>
          <Ionicons name="warning-outline" size={24} color="#ef4444" />
          <Text style={[styles.confirmTitle, { color: colors.foreground }]}>Cancel membership?</Text>
          <Text style={[styles.confirmSub, { color: colors.mutedForeground }]}>
            {member.name}'s membership will be cancelled. This cannot be undone.
          </Text>
          <View style={styles.confirmBtns}>
            <TouchableOpacity onPress={() => setConfirmAction(null)} style={[styles.confirmNo, { borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>Keep</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} disabled={actionLoading} style={[styles.confirmYes, { backgroundColor: '#ef4444', borderRadius: colors.radius }]}>
              <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold' }}>{actionLoading ? 'Cancelling...' : 'Yes, Cancel'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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

function MedBlock({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.medText, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  header: { alignItems: 'center', gap: 10 },
  avatar: { width: 88, height: 88 },
  name: { fontSize: 22, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  card: { padding: 16, borderWidth: 1, gap: 12 },
  medHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { fontSize: 15, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  medText: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  calendarCard: { padding: 16, borderWidth: 1, gap: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  rowValue: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  actions: { flexDirection: 'row', gap: 12 },
  confirmBox: { padding: 20, borderWidth: 1, gap: 12, alignItems: 'center' },
  confirmTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  confirmSub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  confirmBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmNo: { flex: 1, paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
  confirmYes: { flex: 1, paddingVertical: 12, alignItems: 'center' },
});
