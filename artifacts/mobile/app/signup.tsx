import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyledButton } from '@/components/StyledButton';
import { StyledInput } from '@/components/StyledInput';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { createGym, generateGymId, loginOwner } from '@/store';

export default function SignupScreen() {
  const colors = useColors();
  const router = useRouter();
  const { setAuth } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    gymName: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    city: '',
    state: '',
    password: '',
    confirmPassword: '',
  });

  const gymId = form.ownerName && form.ownerPhone && form.city
    ? generateGymId(form.ownerName, form.ownerPhone, form.city)
    : '';

  const update = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleCreate = async () => {
    const { gymName, ownerName, ownerPhone, city, state, password, confirmPassword } = form;
    if (!gymName || !ownerName || !ownerPhone || !city || !state || !password) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const gym = await createGym({
        name: gymName,
        ownerName,
        ownerEmail: form.ownerEmail,
        ownerPhone,
        city,
        state,
        password,
        plan: 'free',
        plans: [
          { id: '1', name: 'Monthly', duration: 1, price: 1000 },
          { id: '2', name: 'Quarterly', duration: 3, price: 2500 },
          { id: '3', name: 'Annual', duration: 12, price: 8000 },
        ],
      });
      const loggedIn = await loginOwner(gym.id, password);
      if (loggedIn) {
        setAuth({ gymId: gym.id, role: 'owner' }, loggedIn);
        Alert.alert('Gym Created!', `Your Gym ID is: ${gym.id}\n\nSave this ID to log in.`, [
          { text: 'Continue', onPress: () => router.replace('/(owner)/dashboard') },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20), paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.foreground }]}>Create Gym Account</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>Set up your gym on The Track</Text>

        <View style={styles.form}>
          <StyledInput label="Gym Name *" value={form.gymName} onChangeText={update('gymName')} placeholder="e.g. FitZone Gym" />
          <StyledInput label="Owner Name *" value={form.ownerName} onChangeText={update('ownerName')} placeholder="Full name" />
          <StyledInput label="Owner Phone *" value={form.ownerPhone} onChangeText={update('ownerPhone')} placeholder="10-digit phone" keyboardType="phone-pad" />
          <StyledInput label="Owner Email" value={form.ownerEmail} onChangeText={update('ownerEmail')} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
          <StyledInput label="City *" value={form.city} onChangeText={update('city')} placeholder="City" />
          <StyledInput label="State *" value={form.state} onChangeText={update('state')} placeholder="State" />
          <StyledInput label="Password *" value={form.password} onChangeText={update('password')} placeholder="Set a password" secureTextEntry />
          <StyledInput label="Confirm Password *" value={form.confirmPassword} onChangeText={update('confirmPassword')} placeholder="Repeat password" secureTextEntry />
        </View>

        {gymId ? (
          <View style={[styles.idBox, { backgroundColor: colors.primary + '22', borderRadius: colors.radius, borderColor: colors.primary + '44' }]}>
            <Text style={[styles.idLabel, { color: colors.mutedForeground }]}>Your Gym ID (save this):</Text>
            <Text style={[styles.idValue, { color: colors.primary }]}>{gymId}</Text>
          </View>
        ) : null}

        <StyledButton title="Create Gym Account" onPress={handleCreate} loading={loading} />

        <TouchableOpacity onPress={() => router.push('/login')} style={{ alignSelf: 'center' }}>
          <Text style={[styles.login, { color: colors.mutedForeground }]}>
            Already have an account? <Text style={{ color: colors.primary }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, gap: 20 },
  back: { alignSelf: 'flex-start' },
  backText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, marginTop: 8 },
  sub: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  form: { gap: 16 },
  idBox: { padding: 16, borderWidth: 1, gap: 4 },
  idLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  idValue: { fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, letterSpacing: 1 },
  login: { fontSize: 14, fontFamily: 'Inter_400Regular' },
});
