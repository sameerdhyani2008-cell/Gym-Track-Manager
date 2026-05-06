import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { StyledButton } from '@/components/StyledButton';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';

export default function TrainerSettingsScreen() {
  const colors = useColors();
  const { isDark, toggleTheme } = useTheme();
  const { gym, trainer, session, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: async () => {
          await logout();
          router.replace('/welcome');
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>Trainer Info</Text>
        <Text style={[styles.trainerName, { color: colors.foreground }]}>{trainer?.name ?? 'Trainer'}</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>{trainer?.phone}</Text>
        {trainer?.specialization ? <Text style={[styles.sub, { color: colors.mutedForeground }]}>{trainer.specialization}</Text> : null}
        <View style={[styles.idRow, { backgroundColor: colors.secondary, borderRadius: 8 }]}>
          <Text style={[styles.idLabel, { color: colors.mutedForeground }]}>Trainer ID:</Text>
          <Text style={[styles.idValue, { color: colors.primary }]}>{trainer?.id}</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>Gym</Text>
        <Text style={[styles.trainerName, { color: colors.foreground }]}>{gym?.name}</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>{gym?.city}, {gym?.state}</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>ID: {gym?.id}</Text>
      </View>

      <View style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Dark Mode</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      </View>

      <StyledButton title="Logout" onPress={handleLogout} variant="destructive" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  card: { padding: 16, borderWidth: 1, gap: 6 },
  cardTitle: { fontSize: 12, fontFamily: 'Inter_500Medium', fontWeight: '500' as const, textTransform: 'uppercase', marginBottom: 4 },
  trainerName: { fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  idRow: { flexDirection: 'row', gap: 8, padding: 10, marginTop: 4, alignItems: 'center' },
  idLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  idValue: { fontSize: 14, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderWidth: 1 },
  toggleLabel: { fontSize: 15, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
});
