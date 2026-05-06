import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyledButton } from '@/components/StyledButton';
import { useColors } from '@/hooks/useColors';

export default function WelcomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#6366f133', '#09090b']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
      />
      <View style={[styles.content, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 40), paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 24) }]}>
        <View style={styles.hero}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={[styles.brand, { color: colors.foreground }]}>The Track</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
            Professional Gym Management{'\n'}Built for Owners & Trainers
          </Text>
        </View>

        <View style={styles.features}>
          {['Track member attendance daily', 'Manage plans, revenue & trainers', 'Member profiles with medical info'].map((f, i) => (
            <View key={i} style={styles.feature}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{f}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <StyledButton title="Login" onPress={() => router.push('/login')} />
          <StyledButton
            title="Create Gym Account"
            variant="outline"
            onPress={() => router.push('/signup')}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, gap: 32, justifyContent: 'space-between' },
  hero: { alignItems: 'center', gap: 12, marginTop: 24 },
  icon: { width: 80, height: 80, borderRadius: 20 },
  brand: { fontSize: 36, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, letterSpacing: -1 },
  tagline: { fontSize: 16, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 24 },
  features: { gap: 12 },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  featureText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  actions: { gap: 12 },
});
