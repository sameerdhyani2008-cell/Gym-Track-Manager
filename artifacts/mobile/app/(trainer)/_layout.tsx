import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

export default function TrainerLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'web' ? 84 : 60,
          paddingBottom: Platform.OS === 'web' ? 34 : 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 10 },
      }}
    >
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && { backgroundColor: colors.navAttendance + '22' }]}>
              <Ionicons name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} size={22} color={focused ? colors.navAttendance : color} />
            </View>
          ),
          tabBarActiveTintColor: colors.navAttendance,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: 'Members',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && { backgroundColor: colors.navMembers + '22' }]}>
              <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={focused ? colors.navMembers : color} />
            </View>
          ),
          tabBarActiveTintColor: colors.navMembers,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && { backgroundColor: colors.navSettings + '22' }]}>
              <Ionicons name={focused ? 'settings' : 'settings-outline'} size={22} color={focused ? colors.navSettings : color} />
            </View>
          ),
          tabBarActiveTintColor: colors.navSettings,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { borderRadius: 8, padding: 4 },
});
