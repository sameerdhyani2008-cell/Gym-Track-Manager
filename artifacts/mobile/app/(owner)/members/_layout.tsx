import { Stack } from 'expo-router';
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';

export default function MembersLayout() {
  const colors = useColors();
  const { customColors } = useTheme();
  const hasGradient = !!(customColors.gradientFrom && customColors.gradientTo);
  const headerBg = hasGradient ? customColors.gradientFrom! : colors.background;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Members' }} />
      <Stack.Screen name="new" options={{ title: 'Add Member', presentation: 'modal' }} />
      <Stack.Screen name="[id]" options={{ title: 'Member Detail' }} />
    </Stack>
  );
}
