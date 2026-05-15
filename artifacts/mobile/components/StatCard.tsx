import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  label: string;
  value: string | number;
  accent?: string;
  sub?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export function StatCard({ label, value, accent, sub, icon, onPress }: Props) {
  const colors = useColors();
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
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
      <View style={styles.top}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
        {icon && (
          <View style={[styles.iconWrap, { backgroundColor: (accent ?? colors.primary) + '22', borderRadius: 8 }]}>
            <Ionicons name={icon} size={16} color={accent ?? colors.primary} />
          </View>
        )}
      </View>
      <Text style={[styles.value, { color: accent ?? colors.foreground }]}>{value}</Text>
      {sub ? <Text style={[styles.sub, { color: colors.mutedForeground }]}>{sub}</Text> : null}
      {onPress && (
        <Text style={[styles.tap, { color: accent ?? colors.primary }]}>View →</Text>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: 14, borderWidth: 1, gap: 4 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconWrap: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, fontFamily: 'Inter_500Medium', fontWeight: '500' as const, flex: 1 },
  value: { fontSize: 26, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  sub: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  tap: { fontSize: 11, fontFamily: 'Inter_600SemiBold', marginTop: 2 },
});
