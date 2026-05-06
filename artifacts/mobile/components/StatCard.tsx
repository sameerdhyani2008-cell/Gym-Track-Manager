import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  label: string;
  value: string | number;
  accent?: string;
  sub?: string;
}

export function StatCard({ label, value, accent, sub }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.value, { color: accent ?? colors.foreground }]}>{value}</Text>
      {sub ? <Text style={[styles.sub, { color: colors.mutedForeground }]}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    gap: 4,
  },
  label: { fontSize: 12, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  value: { fontSize: 24, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  sub: { fontSize: 11, fontFamily: 'Inter_400Regular' },
});
