import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';

export default function OwnerLayout() {
  const colors = useColors();
  const { customColors } = useTheme();

  const hasGradient = !!(customColors.gradientFrom && customColors.gradientTo);
  const headerBg = hasGradient ? customColors.gradientFrom! : colors.background;
  const tabBg = hasGradient ? customColors.gradientTo! : colors.background;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: headerBg, elevation: 0, shadowOpacity: 0 },
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 17 },
        headerShadowVisible: hasGradient ? false : true,
        tabBarStyle: {
          backgroundColor: tabBg,
          borderTopColor: hasGradient ? customColors.gradientTo! : colors.border,
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
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && { backgroundColor: colors.navDashboard + '22' }]}>
              <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={focused ? colors.navDashboard : color} />
            </View>
          ),
          tabBarActiveTintColor: colors.navDashboard,
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
        name="revenue"
        options={{
          title: 'Revenue',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && { backgroundColor: colors.navRevenue + '22' }]}>
              <Ionicons name={focused ? 'cash' : 'cash-outline'} size={22} color={focused ? colors.navRevenue : color} />
            </View>
          ),
          tabBarActiveTintColor: colors.navRevenue,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconWrap, focused && { backgroundColor: colors.navMore + '22' }]}>
              <Ionicons name={focused ? 'menu' : 'menu-outline'} size={22} color={focused ? colors.navMore : color} />
            </View>
          ),
          tabBarActiveTintColor: colors.navMore,
        }}
      />
      <Tabs.Screen name="trainers" options={{ href: null, title: 'Trainers' }} />
      <Tabs.Screen name="plans" options={{ href: null, title: 'Plans' }} />
      <Tabs.Screen name="settings" options={{ href: null, title: 'Settings' }} />
      <Tabs.Screen name="subscription" options={{ href: null, title: 'Subscription' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { borderRadius: 8, padding: 4 },
});
