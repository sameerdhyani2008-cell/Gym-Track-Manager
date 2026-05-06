import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchableDropdown } from '@/components/SearchableDropdown';
import { StyledButton } from '@/components/StyledButton';
import { StyledInput } from '@/components/StyledInput';
import { useAuth } from '@/context/AuthContext';
import { INDIA_STATES, INDIA_STATES_CITIES } from '@/data/india';
import { useColors } from '@/hooks/useColors';
import { createGym, generateGymId, saveSession } from '@/store';

export default function SignupScreen() {
  const colors = useColors();
  const router = useRouter();
  const { setAuth } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ gymId: string } | null>(null);

  const [form, setForm] = useState({
    gymName: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    state: '',
    city: '',
    password: '',
    confirmPassword: '',
  });

  const update = (key: keyof typeof form) => (val: string) => {
    setError('');
    if (key === 'state') {
      setForm(f => ({ ...f, state: val, city: '' }));
    } else {
      setForm(f => ({ ...f, [key]: val }));
    }
  };

  const cityOptions = form.state ? (INDIA_STATES_CITIES[form.state] ?? []) : [];

  const gymId =
    form.ownerName && form.ownerPhone && form.city
      ? generateGymId(form.ownerName, form.ownerPhone, form.city)
      : '';

  const handleCreate = async () => {
    setError('');
    const { gymName, ownerName, ownerPhone, city, state, password, confirmPassword } = form;

    if (!gymName.trim()) { setError('Gym name is required.'); return; }
    if (!ownerName.trim()) { setError('Owner name is required.'); return; }
    if (!ownerPhone.trim()) { setError('Owner phone is required.'); return; }
    if (!state.trim()) { setError('Please select a state.'); return; }
    if (!city.trim()) { setError('Please select a city.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const gym = await createGym({
        name: gymName.trim(),
        ownerName: ownerName.trim(),
        ownerEmail: form.ownerEmail.trim() || undefined,
        ownerPhone: ownerPhone.trim(),
        city: city.trim(),
        state: state.trim(),
        password,
        plan: 'free',
        plans: [
          { id: '1', name: 'Monthly', duration: 1, price: 1000 },
          { id: '2', name: 'Quarterly', duration: 3, price: 2500 },
          { id: '3', name: 'Annual', duration: 12, price: 8000 },
        ],
      });

      await saveSession({ gymId: gym.id, role: 'owner' });
      setAuth({ gymId: gym.id, role: 'owner' }, gym);
      setSuccess({ gymId: gym.id });
    } catch (e) {
      setError('Failed to create gym. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success screen — shown after gym creation
  if (success) {
    return (
      <View style={[styles.successWrap, { backgroundColor: colors.background }]}>
        <View style={[styles.successCard, { backgroundColor: colors.card, borderColor: colors.primary + '44', borderRadius: colors.radius }]}>
          <View style={[styles.successIcon, { backgroundColor: '#22c55e22', borderRadius: 32 }]}>
            <Text style={{ fontSize: 36 }}>🎉</Text>
          </View>
          <Text style={[styles.successTitle, { color: colors.foreground }]}>Gym Created!</Text>
          <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
            Your gym has been set up. Save your Gym ID below — you'll need it to log in.
          </Text>
          <View style={[styles.idBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '44', borderRadius: colors.radius }]}>
            <Text style={[styles.idLabel, { color: colors.mutedForeground }]}>Your Gym ID</Text>
            <Text style={[styles.idValue, { color: colors.primary }]}>{success.gymId}</Text>
            <Text style={[styles.idNote, { color: colors.mutedForeground }]}>
              Write this down or take a screenshot!
            </Text>
          </View>
          <StyledButton
            title="Go to Dashboard"
            onPress={() => router.replace('/(owner)/dashboard')}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20),
            paddingBottom: insets.bottom + 40,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.foreground }]}>Create Gym Account</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>Set up your gym on The Track</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Gym Info</Text>
          <StyledInput label="Gym Name *" value={form.gymName} onChangeText={update('gymName')} placeholder="e.g. FitZone Gym" />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Owner Details</Text>
          <StyledInput label="Owner Name *" value={form.ownerName} onChangeText={update('ownerName')} placeholder="Full name" />
          <StyledInput label="Owner Phone *" value={form.ownerPhone} onChangeText={update('ownerPhone')} placeholder="10-digit phone number" keyboardType="phone-pad" />
          <StyledInput label="Owner Email" value={form.ownerEmail} onChangeText={update('ownerEmail')} placeholder="email@example.com (optional)" keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Location</Text>
          <SearchableDropdown
            label="State *"
            value={form.state}
            onChange={update('state')}
            options={INDIA_STATES}
            placeholder="Select your state"
          />
          <SearchableDropdown
            label="City *"
            value={form.city}
            onChange={update('city')}
            options={cityOptions}
            placeholder={form.state ? 'Select your city' : 'Select state first'}
            disabled={!form.state}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Security</Text>
          <StyledInput label="Password *" value={form.password} onChangeText={update('password')} placeholder="Set a strong password" secureTextEntry />
          <StyledInput label="Confirm Password *" value={form.confirmPassword} onChangeText={update('confirmPassword')} placeholder="Repeat your password" secureTextEntry />
        </View>

        {gymId ? (
          <View style={[styles.idBox, { backgroundColor: colors.primary + '15', borderRadius: colors.radius, borderColor: colors.primary + '44' }]}>
            <Text style={[styles.idLabel, { color: colors.mutedForeground }]}>Your Gym ID (auto-generated):</Text>
            <Text style={[styles.idValue, { color: colors.primary }]}>{gymId}</Text>
            <Text style={[styles.idNote, { color: colors.mutedForeground }]}>
              {form.ownerName.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)} (initials) + {form.ownerPhone.replace(/\D/g, '').slice(-4)} (last 4 digits) + {form.city.trim().slice(-1).toUpperCase()} (city last letter)
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: '#ef444422', borderColor: '#ef444444', borderRadius: colors.radius }]}>
            <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>
          </View>
        ) : null}

        <StyledButton title="Create Gym Account" onPress={handleCreate} loading={loading} />

        <TouchableOpacity onPress={() => router.push('/login')} style={{ alignSelf: 'center' }}>
          <Text style={[styles.loginLink, { color: colors.mutedForeground }]}>
            Already have an account? <Text style={{ color: colors.primary }}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, gap: 24 },
  back: { alignSelf: 'flex-start' },
  backText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, marginTop: 8 },
  sub: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  section: { gap: 14 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  idBox: { padding: 16, borderWidth: 1, gap: 6 },
  idLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  idValue: { fontSize: 28, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, letterSpacing: 2 },
  idNote: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 16 },
  errorBox: { padding: 14, borderWidth: 1 },
  errorText: { fontSize: 14, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  loginLink: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  // Success screen
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successCard: { width: '100%', maxWidth: 400, padding: 28, borderWidth: 1, gap: 20, alignItems: 'center' },
  successIcon: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  successSub: { fontSize: 15, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 22 },
});
