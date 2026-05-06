import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export function StyledInput({ label, error, style, ...rest }: Props) {
  const colors = useColors();
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: error ? colors.destructive : colors.border,
            color: colors.foreground,
            borderRadius: colors.radius,
          },
          style,
        ]}
        placeholderTextColor={colors.mutedForeground}
        {...rest}
      />
      {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    borderWidth: 1,
  },
  error: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
