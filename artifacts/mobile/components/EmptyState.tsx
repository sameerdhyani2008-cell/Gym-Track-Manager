import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: Props) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.mutedForeground} />
      <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
      {subtitle ? <Text style={[styles.sub, { color: colors.mutedForeground }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  title: { fontSize: 16, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const, textAlign: 'center' },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
