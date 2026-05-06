import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StyledButton } from '@/components/StyledButton';
import { StyledInput } from '@/components/StyledInput';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useColors } from '@/hooks/useColors';
import { updateGymSettings } from '@/store';

export default function OwnerSettingsScreen() {
  const colors = useColors();
  const { gym, session, refreshGym, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');
  const [form, setForm] = useState({
    name: gym?.name ?? '',
    ownerName: gym?.ownerName ?? '',
    ownerEmail: gym?.ownerEmail ?? '',
    ownerPhone: gym?.ownerPhone ?? '',
    city: gym?.city ?? '',
    state: gym?.state ?? '',
  });

  useEffect(() => {
    if (gym) {
      setForm({
        name: gym.name,
        ownerName: gym.ownerName,
        ownerEmail: gym.ownerEmail ?? '',
        ownerPhone: gym.ownerPhone,
        city: gym.city,
        state: gym.state,
      });
    }
  }, [gym]);

  const update = (key: keyof typeof form) => (val: string) => {
    setSaveMsg(''); setSaveErr('');
    setForm(f => ({ ...f, [key]: val }));
  };

  const handleSave = async () => {
    if (!session?.gymId) return;
    setLoading(true); setSaveMsg(''); setSaveErr('');
    try {
      await updateGymSettings(session.gymId, form);
      await refreshGym();
      setSaveMsg('Settings saved successfully.');
    } catch {
      setSaveErr('Failed to save. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/welcome');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>Gym ID</Text>
        <Text style={[styles.gymId, { color: colors.primary }]}>{gym?.id}</Text>
        <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 8 }]}>Plan</Text>
        <Text style={[styles.planBadge, { color: gym?.plan === 'pro' ? '#f59e0b' : colors.mutedForeground }]}>
          {gym?.plan?.toUpperCase() ?? 'FREE'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Gym Info</Text>
        <StyledInput label="Gym Name" value={form.name} onChangeText={update('name')} />
        <StyledInput label="Owner Name" value={form.ownerName} onChangeText={update('ownerName')} />
        <StyledInput label="Owner Email" value={form.ownerEmail} onChangeText={update('ownerEmail')} keyboardType="email-address" autoCapitalize="none" />
        <StyledInput label="Owner Phone" value={form.ownerPhone} onChangeText={update('ownerPhone')} keyboardType="phone-pad" />
        <StyledInput label="City" value={form.city} onChangeText={update('city')} />
        <StyledInput label="State" value={form.state} onChangeText={update('state')} />
      </View>

      {saveMsg ? (
        <View style={[styles.msgBox, { backgroundColor: '#22c55e22', borderColor: '#22c55e44', borderRadius: colors.radius }]}>
          <Text style={{ color: '#22c55e', fontFamily: 'Inter_500Medium', fontSize: 14 }}>{saveMsg}</Text>
        </View>
      ) : null}
      {saveErr ? (
        <View style={[styles.msgBox, { backgroundColor: '#ef444422', borderColor: '#ef444444', borderRadius: colors.radius }]}>
          <Text style={{ color: '#ef4444', fontFamily: 'Inter_500Medium', fontSize: 14 }}>{saveErr}</Text>
        </View>
      ) : null}

      <StyledButton title="Save Changes" onPress={handleSave} loading={loading} />

      <View style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Dark Mode</Text>
        <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
      </View>

      <StyledButton title="Logout" onPress={handleLogout} variant="destructive" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 20, paddingBottom: 40 },
  infoBox: { padding: 16, borderWidth: 1, gap: 4 },
  label: { fontSize: 12, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  gymId: { fontSize: 22, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, letterSpacing: 1 },
  planBadge: { fontSize: 14, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  section: { gap: 16 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  msgBox: { padding: 14, borderWidth: 1 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderWidth: 1 },
  toggleLabel: { fontSize: 15, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
});
