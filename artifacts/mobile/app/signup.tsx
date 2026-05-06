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
    if (key === 'state') {
      setForm(f => ({ ...f, state: val, city: '' }));
    } else {
      setForm(f => ({ ...f, [key]: val }));
    }
  };

  const cityOptions = form.state
    ? (INDIA_STATES_CITIES[form.state] ?? [])
    : [];

  const gymId =
    form.ownerName && form.ownerPhone && form.city
      ? generateGymId(form.ownerName, form.ownerPhone, form.city)
      : '';

  const handleCreate = async () => {
    const { gymName, ownerName, ownerPhone, city, state, password, confirmPassword } = form;
    if (!gymName.trim()) { Alert.alert('Missing', 'Enter gym name'); return; }
    if (!ownerName.trim()) { Alert.alert('Missing', 'Enter owner name'); return; }
    if (!ownerPhone.trim()) { Alert.alert('Missing', 'Enter owner phone'); return; }
    if (!state.trim()) { Alert.alert('Missing', 'Select state'); return; }
    if (!city.trim()) { Alert.alert('Missing', 'Select city'); return; }
    if (!password.trim()) { Alert.alert('Missing', 'Set a password'); return; }
    if (password !== confirmPassword) { Alert.alert('Error', 'Passwords do not match'); return; }

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

      // Save session directly (don't rely on loginOwner round-trip)
      await saveSession({ gymId: gym.id, role: 'owner' });
      setAuth({ gymId: gym.id, role: 'owner' }, gym);

      Alert.alert(
        'Gym Created!',
        `Your Gym ID is:\n\n${gym.id}\n\nSave this ID — you need it to log in.`,
        [{ text: 'Continue to Dashboard', onPress: () => router.replace('/(owner)/dashboard') }],
        { cancelable: false }
      );
    } catch (e) {
      Alert.alert('Error', 'Failed to create gym. Please try again.');
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
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Set up your gym on The Track
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Gym Info</Text>
          <StyledInput
            label="Gym Name *"
            value={form.gymName}
            onChangeText={update('gymName')}
            placeholder="e.g. FitZone Gym"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Owner Details</Text>
          <StyledInput
            label="Owner Name *"
            value={form.ownerName}
            onChangeText={update('ownerName')}
            placeholder="Full name"
          />
          <StyledInput
            label="Owner Phone *"
            value={form.ownerPhone}
            onChangeText={update('ownerPhone')}
            placeholder="10-digit phone number"
            keyboardType="phone-pad"
          />
          <StyledInput
            label="Owner Email"
            value={form.ownerEmail}
            onChangeText={update('ownerEmail')}
            placeholder="email@example.com (optional)"
            keyboardType="email-address"
            autoCapitalize="none"
          />
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
          <StyledInput
            label="Password *"
            value={form.password}
            onChangeText={update('password')}
            placeholder="Set a strong password"
            secureTextEntry
          />
          <StyledInput
            label="Confirm Password *"
            value={form.confirmPassword}
            onChangeText={update('confirmPassword')}
            placeholder="Repeat your password"
            secureTextEntry
          />
        </View>

        {gymId ? (
          <View
            style={[
              styles.idBox,
              {
                backgroundColor: colors.primary + '15',
                borderRadius: colors.radius,
                borderColor: colors.primary + '44',
              },
            ]}
          >
            <Text style={[styles.idLabel, { color: colors.mutedForeground }]}>
              Your Gym ID (auto-generated — save this):
            </Text>
            <Text style={[styles.idValue, { color: colors.primary }]}>{gymId}</Text>
            <Text style={[styles.idNote, { color: colors.mutedForeground }]}>
              {form.ownerName.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0,2)} (initials) + {form.ownerPhone.replace(/\D/g, '').slice(-4)} (last 4 digits) + {form.city.trim().slice(-1).toUpperCase()} (city last letter)
            </Text>
          </View>
        ) : null}

        <StyledButton
          title="Create Gym Account"
          onPress={handleCreate}
          loading={loading}
        />

        <TouchableOpacity
          onPress={() => router.push('/login')}
          style={{ alignSelf: 'center' }}
        >
          <Text style={[styles.loginLink, { color: colors.mutedForeground }]}>
            Already have an account?{' '}
            <Text style={{ color: colors.primary }}>Login</Text>
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
  idValue: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700' as const,
    letterSpacing: 2,
  },
  idNote: { fontSize: 11, fontFamily: 'Inter_400Regular', lineHeight: 16 },
  loginLink: { fontSize: 14, fontFamily: 'Inter_400Regular' },
});
