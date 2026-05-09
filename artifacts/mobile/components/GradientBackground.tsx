import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function GradientBackground({ children, style }: Props) {
  const colors = useColors();
  const { customColors } = useTheme();

  if (customColors.gradientFrom && customColors.gradientTo) {
    const dir = customColors.gradientDirection ?? 'vertical';
    const start =
      dir === 'horizontal' ? { x: 0, y: 0.5 }
      : dir === 'diagonal'  ? { x: 0, y: 0 }
      : { x: 0.5, y: 0 };
    const end =
      dir === 'horizontal' ? { x: 1, y: 0.5 }
      : dir === 'diagonal'  ? { x: 1, y: 1 }
      : { x: 0.5, y: 1 };

    return (
      <LinearGradient
        colors={[customColors.gradientFrom, customColors.gradientTo]}
        start={start}
        end={end}
        style={[{ flex: 1 }, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      {children}
    </View>
  );
}
