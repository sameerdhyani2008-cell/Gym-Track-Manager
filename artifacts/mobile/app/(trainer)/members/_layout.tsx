import { Stack } from 'expo-router';
import React from 'react';
import { useColors } from '@/hooks/useColors';

export default function TrainerMembersLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
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
