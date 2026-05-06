import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyledButton } from '@/components/StyledButton';
import { StyledInput } from '@/components/StyledInput';
import { useColors } from '@/hooks/useColors';
import { getGymById } from '@/store';

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [gymId, setGymId] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!gymId.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const gym = await getGymById(gymId.trim());
    if (!gym) {
      setOtp('');
      setLoading(false);
      return;
    }
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(mockOtp);
    setLoading(false);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 20), paddingBottom: insets.bottom + 24 },
      ]}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.foreground }]}>Reset Password</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground }]}>
        Enter your Gym ID to receive a reset code
      </Text>

      <StyledInput
        label="Gym ID"
        value={gymId}
        onChangeText={setGymId}
        placeholder="Your Gym ID"
        autoCapitalize="characters"
      />

      <StyledButton title="Send OTP" onPress={handleSendOTP} loading={loading} disabled={!gymId.trim()} />

      {otp ? (
        <View style={[styles.otpBox, { backgroundColor: colors.primary + '22', borderRadius: colors.radius, borderColor: colors.primary + '44' }]}>
          <Text style={[styles.otpLabel, { color: colors.mutedForeground }]}>Your OTP (shown for demo):</Text>
          <Text style={[styles.otpValue, { color: colors.primary }]}>{otp}</Text>
          <Text style={[styles.otpNote, { color: colors.mutedForeground }]}>
            In production, this would be sent to the registered phone/email.{'\n'}
            Please contact your gym admin to reset your password.
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingHorizontal: 24, gap: 24 },
  back: { alignSelf: 'flex-start' },
  backText: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, marginTop: 8 },
  sub: { fontSize: 15, fontFamily: 'Inter_400Regular' },
  otpBox: { padding: 20, borderWidth: 1, gap: 8, alignItems: 'center' },
  otpLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  otpValue: { fontSize: 40, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, letterSpacing: 8 },
  otpNote: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18 },
});
