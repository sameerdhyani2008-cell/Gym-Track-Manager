import { Ionicons } from '@expo/vector-icons';
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

const ACCENT_COLORS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Teal', value: '#14b8a6' },
];

const BACKGROUND_COLORS_LIGHT = [
  { label: 'White', value: '#fafafa' },
  { label: 'Cream', value: '#fffbeb' },
  { label: 'Sky', value: '#f0f9ff' },
  { label: 'Lavender', value: '#f5f3ff' },
  { label: 'Mint', value: '#f0fdf4' },
  { label: 'Rose', value: '#fff1f2' },
  { label: 'Slate', value: '#f8fafc' },
  { label: 'Sand', value: '#fef3c7' },
];

const BACKGROUND_COLORS_DARK = [
  { label: 'Zinc', value: '#09090b' },
  { label: 'Slate', value: '#0f172a' },
  { label: 'Navy', value: '#0a0f1e' },
  { label: 'Stone', value: '#0c0a09' },
  { label: 'Neutral', value: '#0a0a0a' },
  { label: 'Indigo', value: '#0e0f1f' },
  { label: 'Forest', value: '#071a0f' },
  { label: 'Wine', value: '#150a0a' },
];

const TEXT_COLORS_LIGHT = [
  { label: 'Black', value: '#09090b' },
  { label: 'Slate', value: '#1e293b' },
  { label: 'Gray', value: '#374151' },
  { label: 'Warm', value: '#292524' },
  { label: 'Indigo', value: '#312e81' },
  { label: 'Forest', value: '#14532d' },
];

const TEXT_COLORS_DARK = [
  { label: 'White', value: '#fafafa' },
  { label: 'Off-white', value: '#e4e4e7' },
  { label: 'Silver', value: '#a1a1aa' },
  { label: 'Warm', value: '#fef3c7' },
  { label: 'Sky', value: '#bae6fd' },
  { label: 'Lavender', value: '#ddd6fe' },
];

function ColorSwatch({
  color,
  selected,
  onPress,
}: {
  color: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        swatchStyles.swatch,
        { backgroundColor: color },
        selected && swatchStyles.swatchSelected,
      ]}
    >
      {selected && <Ionicons name="checkmark" size={14} color="#fff" />}
    </TouchableOpacity>
  );
}

function ColorSection({
  title,
  subtitle,
  swatches,
  activeValue,
  onSelect,
  onReset,
  colors,
}: {
  title: string;
  subtitle: string;
  swatches: { label: string; value: string }[];
  activeValue?: string;
  onSelect: (val: string) => void;
  onReset: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
          <Text style={[swatchStyles.sectionLabel, { color: colors.foreground }]}>{title}</Text>
          <Text style={[swatchStyles.sectionSub, { color: colors.mutedForeground }]}>{subtitle}</Text>
        </View>
        {activeValue && (
          <TouchableOpacity onPress={onReset}>
            <Text style={[swatchStyles.resetBtn, { color: colors.primary }]}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={swatchStyles.swatchRow}>
        {swatches.map(s => (
          <ColorSwatch
            key={s.value}
            color={s.value}
            selected={activeValue === s.value}
            onPress={() => onSelect(s.value)}
          />
        ))}
      </View>
    </View>
  );
}

export default function OwnerSettingsScreen() {
  const colors = useColors();
  const { gym, session, refreshGym, logout } = useAuth();
  const { isDark, toggleTheme, customColors, setCustomColor, resetCustomColors } = useTheme();
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

  const bgSwatches = isDark ? BACKGROUND_COLORS_DARK : BACKGROUND_COLORS_LIGHT;
  const textSwatches = isDark ? TEXT_COLORS_DARK : TEXT_COLORS_LIGHT;

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

      <View style={[styles.appearanceCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Appearance</Text>
          {(customColors.primary || customColors.background || customColors.foreground) && (
            <TouchableOpacity onPress={resetCustomColors}>
              <Text style={[swatchStyles.resetBtn, { color: colors.destructive }]}>Reset All</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.toggleRow, { backgroundColor: colors.secondary, borderColor: colors.border, borderRadius: colors.radius, marginBottom: 20 }]}>
          <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Dark Mode</Text>
          <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
        </View>

        <View style={{ gap: 20 }}>
          <ColorSection
            title="Accent Color"
            subtitle="Buttons, tabs & highlights"
            swatches={ACCENT_COLORS}
            activeValue={customColors.primary}
            onSelect={v => setCustomColor('primary', v)}
            onReset={() => setCustomColor('primary', null)}
            colors={colors}
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <ColorSection
            title="Background"
            subtitle="App background color"
            swatches={bgSwatches}
            activeValue={customColors.background}
            onSelect={v => setCustomColor('background', v)}
            onReset={() => setCustomColor('background', null)}
            colors={colors}
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <ColorSection
            title="Text Color"
            subtitle="Main text across the app"
            swatches={textSwatches}
            activeValue={customColors.foreground}
            onSelect={v => setCustomColor('foreground', v)}
            onReset={() => setCustomColor('foreground', null)}
            colors={colors}
          />
        </View>

        <View style={[styles.previewRow, { backgroundColor: colors.background, borderColor: colors.border, borderRadius: colors.radius, marginTop: 20 }]}>
          <Text style={[styles.previewLabel, { color: colors.mutedForeground }]}>Preview</Text>
          <View style={[styles.previewChip, { backgroundColor: colors.primary, borderRadius: 8 }]}>
            <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>Button</Text>
          </View>
          <Text style={[styles.previewText, { color: colors.foreground }]}>Sample Text</Text>
        </View>
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
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderWidth: 1 },
  toggleLabel: { fontSize: 15, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  appearanceCard: { padding: 16, borderWidth: 1, gap: 0 },
  divider: { height: StyleSheet.hairlineWidth },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1 },
  previewLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', flex: 1 },
  previewChip: { paddingHorizontal: 14, paddingVertical: 7 },
  previewText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
});

const swatchStyles = StyleSheet.create({
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  swatchSelected: { borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  sectionLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  sectionSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  resetBtn: { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
});
