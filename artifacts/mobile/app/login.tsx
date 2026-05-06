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
import { StyledButton } from '@/components/StyledButton';
import { StyledInput } from '@/components/StyledInput';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { loginOwner, loginTrainer } from '@/store';

type Role = 'owner' | 'trainer';

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const { setAuth } = useAuth();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<Role>('owner');
  const [gymId, setGymId] = useState('');
  const [trainerId, setTrainerId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      if (role === 'owner') {
        if (!gymId.trim()) { setError('Please enter your Gym ID.'); return; }
        if (!password.trim()) { setError('Please enter your password.'); return; }
        const gym = await loginOwner(gymId.trim().toUpperCase(), password.trim());
        if (!gym) { setError('Invalid Gym ID or password. Check your credentials and try again.'); return; }
        setAuth({ gymId: gym.id, role: 'owner' }, gym);
        router.replace('/(owner)/dashboard');
      } else {
        if (!trainerId.trim()) { setError('Please enter your Trainer ID.'); return; }
        if (!password.trim()) { setError('Please enter your password.'); return; }
        const result = await loginTrainer(trainerId.trim().toUpperCase(), password.trim());
        if (!result) { setError('Invalid Trainer ID or password. Check your credentials and try again.'); return; }
        setAuth({ gymId: result.gym.id, role: 'trainer', trainerId: result.trainer.id }, result.gym, result.trainer);
        router.replace('/(trainer)/attendance');
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

        <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>Sign in to your gym account</Text>

        <View style={[styles.tabs, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
          {(['owner', 'trainer'] as Role[]).map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => { setRole(r); setError(''); }}
              style={[
                styles.tab,
                { borderRadius: colors.radius - 2 },
                role === r && { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[styles.tabText, { color: role === r ? colors.primaryForeground : colors.mutedForeground }]}>
                {r === 'owner' ? 'Owner' : 'Trainer'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          {role === 'owner' ? (
            <>
              <StyledInput
                label="Gym ID"
                value={gymId}
                onChangeText={v => { setGymId(v); setError(''); }}
                placeholder="e.g. JS3210I"
                autoCapitalize="characters"
              />
              <StyledInput
                label="Password"
                value={password}
                onChangeText={v => { setPassword(v); setError(''); }}
                placeholder="Your password"
                secureTextEntry
              />
            </>
          ) : (
            <>
              <StyledInput
                label="Trainer ID"
                value={trainerId}
                onChangeText={v => { setTrainerId(v); setError(''); }}
                placeholder="e.g. TRJSJS3247"
                autoCapitalize="characters"
              />
              <StyledInput
                label="Password"
                value={password}
                onChangeText={v => { setPassword(v); setError(''); }}
                placeholder="Your password"
                secureTextEntry
              />
            </>
          )}
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: '#ef444422', borderColor: '#ef444444', borderRadius: colors.radius }]}>
            <Text style={[styles.errorText, { color: '#ef4444' }]}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity onPress={() => router.push('/forgot-password')} style={{ alignSelf: 'flex-end' }}>
          <Text style={[styles.forgot, { color: colors.primary }]}>Forgot password?</Text>
        </TouchableOpacity>

        <StyledButton title="Sign In" onPress={handleLogin} loading={loading} />

        <TouchableOpacity onPress={() => router.push('/signup')} style={{ alignSelf: 'center' }}>
          <Text style={[styles.signup, { color: colors.mutedForeground }]}>
            No account? <Text style={{ color: colors.primary }}>Create one</Text>
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
  tabs: { flexDirection: 'row', padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  form: { gap: 16 },
  errorBox: { padding: 14, borderWidth: 1 },
  errorText: { fontSize: 14, fontFamily: 'Inter_500Medium', fontWeight: '500' as const, lineHeight: 20 },
  forgot: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  signup: { fontSize: 14, fontFamily: 'Inter_400Regular' },
});
