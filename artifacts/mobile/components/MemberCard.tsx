import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { Member } from '@/types';

interface Props {
  member: Member;
  onPress?: () => void;
}

export function MemberCard({ member, onPress }: Props) {
  const colors = useColors();
  const isActive = member.status === 'active';
  const statusColor = isActive ? '#22c55e' : member.status === 'expired' ? '#f59e0b' : '#ef4444';

  const daysLeft = (() => {
    const end = new Date(member.endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / 86400000);
  })();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={styles.left}>
        {member.photo ? (
          <Image source={{ uri: member.photo }} style={[styles.avatar, { borderRadius: 22 }]} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: colors.primary + '33', borderRadius: 22, alignItems: 'center', justifyContent: 'center' }]}>
            <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 16 }}>
              {member.name[0]?.toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]}>{member.name}</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>{member.phone}</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>{member.planName ?? 'No Plan'}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{member.status}</Text>
        </View>
        {isActive && (
          <Text style={[styles.days, { color: daysLeft < 7 ? '#f59e0b' : colors.mutedForeground }]}>
            {daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 44, height: 44 },
  info: { gap: 2, flex: 1 },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  sub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  right: { alignItems: 'flex-end', gap: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const, textTransform: 'capitalize' },
  days: { fontSize: 11, fontFamily: 'Inter_500Medium' },
});
