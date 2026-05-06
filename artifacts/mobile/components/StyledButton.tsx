import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';
import { useColors } from '@/hooks/useColors';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
}

export function StyledButton({ title, onPress, variant = 'primary', loading, disabled, style, small }: Props) {
  const colors = useColors();

  const bg = {
    primary: colors.primary,
    secondary: colors.secondary,
    destructive: colors.destructive,
    outline: 'transparent',
  }[variant];

  const textColor = {
    primary: colors.primaryForeground,
    secondary: colors.secondaryForeground,
    destructive: colors.destructiveForeground,
    outline: colors.foreground,
  }[variant];

  const borderColor = variant === 'outline' ? colors.border : 'transparent';

  const handlePress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.btn,
        {
          backgroundColor: bg,
          borderColor,
          borderRadius: colors.radius,
          paddingVertical: small ? 8 : 14,
          opacity: disabled ? 0.5 : 1,
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor, fontSize: small ? 13 : 15 }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600' as const,
  },
});
