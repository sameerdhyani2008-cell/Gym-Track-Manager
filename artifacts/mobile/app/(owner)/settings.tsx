import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { GradientBackground } from '@/components/GradientBackground';
import { StyledButton } from '@/components/StyledButton';
import { StyledInput } from '@/components/StyledInput';
import { useAuth } from '@/context/AuthContext';
import { type GradientDirection, useTheme } from '@/context/ThemeContext';
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
  { label: 'Warm', value: '#fdf8f0' },
  { label: 'Cream', value: '#fffbeb' },
  { label: 'Sand', value: '#fef3c7' },
  { label: 'Sky', value: '#f0f9ff' },
  { label: 'Lavender', value: '#f5f3ff' },
  { label: 'Blush', value: '#fff1f2' },
  { label: 'Mint', value: '#f0fdf4' },
  { label: 'Slate', value: '#f1f5f9' },
  { label: 'Peach', value: '#fff7ed' },
  { label: 'Lilac', value: '#faf5ff' },
  { label: 'Cloud', value: '#f8fafc' },
];

const BACKGROUND_COLORS_DARK = [
  { label: 'Zinc', value: '#09090b' },
  { label: 'Charcoal', value: '#1a1a1a' },
  { label: 'Slate', value: '#0f172a' },
  { label: 'Navy', value: '#0c1425' },
  { label: 'Midnight', value: '#121212' },
  { label: 'Indigo', value: '#12101f' },
  { label: 'Forest', value: '#0a1a0f' },
  { label: 'Wine', value: '#1a0808' },
  { label: 'Coffee', value: '#1c1208' },
  { label: 'Teal', value: '#071a18' },
  { label: 'Plum', value: '#160d1f' },
  { label: 'Ash', value: '#111118' },
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

const GRADIENT_COLORS = [
  { label: 'Black', value: '#000000' },
  { label: 'Zinc', value: '#18181b' },
  { label: 'Navy', value: '#0f172a' },
  { label: 'Indigo', value: '#312e81' },
  { label: 'Violet', value: '#4c1d95' },
  { label: 'Purple', value: '#581c87' },
  { label: 'Fuchsia', value: '#701a75' },
  { label: 'Rose', value: '#881337' },
  { label: 'Wine', value: '#7f1d1d' },
  { label: 'Blue', value: '#1e3a8a' },
  { label: 'Teal', value: '#134e4a' },
  { label: 'Forest', value: '#14532d' },
  { label: 'Gold', value: '#78350f' },
  { label: 'Slate', value: '#1e293b' },
  { label: 'White', value: '#ffffff' },
  { label: 'Cream', value: '#fef9f0' },
  { label: 'Sky', value: '#e0f2fe' },
  { label: 'Lavender', value: '#ede9fe' },
  { label: 'Blush', value: '#fce7f3' },
  { label: 'Mint', value: '#d1fae5' },
];

const GRADIENT_DIRECTIONS: { label: string; value: GradientDirection; icon: string }[] = [
  { label: 'Top → Bottom', value: 'vertical', icon: '↓' },
  { label: 'Left → Right', value: 'horizontal', icon: '→' },
  { label: 'Diagonal', value: 'diagonal', icon: '↘' },
];

function ColorSwatch({
  color,
  label,
  selected,
  onPress,
}: {
  color: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={swatchStyles.swatchWrap}>
      <View
        style={[
          swatchStyles.swatch,
          { backgroundColor: color },
          selected ? swatchStyles.swatchSelected : swatchStyles.swatchBorder,
        ]}
      >
        {selected && <Ionicons name="checkmark" size={14} color={color === '#ffffff' || color === '#fafafa' || color === '#e0f2fe' || color === '#ede9fe' || color === '#fce7f3' || color === '#d1fae5' || color === '#fef9f0' || color === '#fef3c7' ? '#000' : '#fff'} />}
      </View>
      <Text style={[swatchStyles.swatchLabel, selected && swatchStyles.swatchLabelActive]}>{label}</Text>
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
            label={s.label}
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
  const [gradientPicking, setGradientPicking] = useState<'from' | 'to' | null>(null);
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

  const gradientFrom = customColors.gradientFrom;
  const gradientTo = customColors.gradientTo;
  const gradientDir = customColors.gradientDirection ?? 'vertical';
  const hasGradient = !!(gradientFrom && gradientTo);

  const clearGradient = () => {
    setCustomColor('gradientFrom', null);
    setCustomColor('gradientTo', null);
  };

  const gradientStart = gradientDir === 'horizontal' ? { x: 0, y: 0.5 } : gradientDir === 'diagonal' ? { x: 0, y: 0 } : { x: 0.5, y: 0 };
  const gradientEnd   = gradientDir === 'horizontal' ? { x: 1, y: 0.5 } : gradientDir === 'diagonal' ? { x: 1, y: 1 } : { x: 0.5, y: 1 };

  const hasAnyCustom = !!(customColors.primary || customColors.background || customColors.foreground || hasGradient);

  return (
    <GradientBackground>
    <ScrollView style={{ flex: 1, backgroundColor: 'transparent' }} contentContainerStyle={styles.container}>
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

      {/* Appearance Card */}
      <View style={[styles.appearanceCard, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Appearance</Text>
          {hasAnyCustom && (
            <TouchableOpacity onPress={() => { resetCustomColors(); setGradientPicking(null); }}>
              <Text style={[swatchStyles.resetBtn, { color: colors.destructive }]}>Reset All</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.toggleRow, { backgroundColor: colors.secondary, borderColor: colors.border, borderRadius: colors.radius, marginBottom: 20 }]}>
          <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Dark Mode</Text>
          <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
        </View>

        <View style={{ gap: 20 }}>
          {/* Accent color */}
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

          {/* Solid background */}
          <ColorSection
            title="Background"
            subtitle="App solid background color"
            swatches={bgSwatches}
            activeValue={hasGradient ? undefined : customColors.background}
            onSelect={v => { clearGradient(); setCustomColor('background', v); }}
            onReset={() => setCustomColor('background', null)}
            colors={colors}
          />

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Gradient section */}
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ gap: 2 }}>
                <Text style={[swatchStyles.sectionLabel, { color: colors.foreground }]}>Gradient Background</Text>
                <Text style={[swatchStyles.sectionSub, { color: colors.mutedForeground }]}>Blend two colours like Canva</Text>
              </View>
              {hasGradient && (
                <TouchableOpacity onPress={clearGradient}>
                  <Text style={[swatchStyles.resetBtn, { color: colors.primary }]}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Live gradient preview */}
            {hasGradient ? (
              <LinearGradient
                colors={[gradientFrom!, gradientTo!]}
                start={gradientStart}
                end={gradientEnd}
                style={[styles.gradientPreview, { borderRadius: colors.radius }]}
              >
                <Text style={styles.gradientPreviewText}>Preview</Text>
              </LinearGradient>
            ) : (
              <View style={[styles.gradientPreviewEmpty, { borderColor: colors.border, borderRadius: colors.radius }]}>
                <Text style={[styles.gradientPreviewHint, { color: colors.mutedForeground }]}>Pick two colours below to create a gradient</Text>
              </View>
            )}

            {/* From / To selector buttons */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setGradientPicking(gradientPicking === 'from' ? null : 'from')}
                style={[
                  styles.gradientSlotBtn,
                  { borderColor: gradientPicking === 'from' ? colors.primary : colors.border, borderRadius: colors.radius },
                  gradientFrom ? { backgroundColor: gradientFrom } : { backgroundColor: colors.secondary },
                ]}
              >
                {gradientFrom ? (
                  <View style={{ alignItems: 'center', gap: 2 }}>
                    <Ionicons name="ellipse" size={18} color={gradientFrom} style={{ opacity: 0 }} />
                    <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 11, textShadowColor: '#0008', textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } }}>From</Text>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', gap: 4 }}>
                    <Ionicons name="add-circle-outline" size={20} color={colors.mutedForeground} />
                    <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 11 }}>From</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
                <Text style={{ color: colors.mutedForeground, fontSize: 18 }}>→</Text>
              </View>

              <TouchableOpacity
                onPress={() => setGradientPicking(gradientPicking === 'to' ? null : 'to')}
                style={[
                  styles.gradientSlotBtn,
                  { borderColor: gradientPicking === 'to' ? colors.primary : colors.border, borderRadius: colors.radius },
                  gradientTo ? { backgroundColor: gradientTo } : { backgroundColor: colors.secondary },
                ]}
              >
                {gradientTo ? (
                  <View style={{ alignItems: 'center', gap: 2 }}>
                    <Ionicons name="ellipse" size={18} color={gradientTo} style={{ opacity: 0 }} />
                    <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 11, textShadowColor: '#0008', textShadowRadius: 4, textShadowOffset: { width: 0, height: 1 } }}>To</Text>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', gap: 4 }}>
                    <Ionicons name="add-circle-outline" size={20} color={colors.mutedForeground} />
                    <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 11 }}>To</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Color picker for selected slot */}
            {gradientPicking && (
              <View style={{ gap: 8 }}>
                <Text style={[swatchStyles.sectionSub, { color: colors.mutedForeground }]}>
                  Pick {gradientPicking === 'from' ? '"From"' : '"To"'} colour:
                </Text>
                <View style={swatchStyles.swatchRow}>
                  {GRADIENT_COLORS.map(s => (
                    <ColorSwatch
                      key={s.value}
                      color={s.value}
                      label={s.label}
                      selected={(gradientPicking === 'from' ? gradientFrom : gradientTo) === s.value}
                      onPress={() => {
                        setCustomColor(gradientPicking === 'from' ? 'gradientFrom' : 'gradientTo', s.value);
                        if (gradientPicking === 'from' && !gradientTo) setGradientPicking('to');
                        else setGradientPicking(null);
                      }}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Direction toggle */}
            {hasGradient && (
              <View style={{ gap: 8 }}>
                <Text style={[swatchStyles.sectionSub, { color: colors.mutedForeground }]}>Direction</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {GRADIENT_DIRECTIONS.map(d => (
                    <TouchableOpacity
                      key={d.value}
                      onPress={() => setCustomColor('gradientDirection', d.value)}
                      style={[
                        styles.dirBtn,
                        {
                          borderRadius: colors.radius,
                          borderColor: gradientDir === d.value ? colors.primary : colors.border,
                          backgroundColor: gradientDir === d.value ? colors.primary + '22' : colors.secondary,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 16 }}>{d.icon}</Text>
                      <Text style={[styles.dirLabel, { color: gradientDir === d.value ? colors.primary : colors.mutedForeground }]}>{d.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Text color */}
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

        {/* Preview strip */}
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
    </GradientBackground>
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
  gradientPreview: { height: 80, alignItems: 'center', justifyContent: 'center' },
  gradientPreviewText: { color: '#fff', fontFamily: 'Inter_600SemiBold', fontSize: 14, textShadowColor: '#0006', textShadowRadius: 6, textShadowOffset: { width: 0, height: 1 } },
  gradientPreviewEmpty: { height: 80, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  gradientPreviewHint: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  gradientSlotBtn: { flex: 1, height: 64, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dirBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderWidth: 1, gap: 2 },
  dirLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', textAlign: 'center' },
});

const swatchStyles = StyleSheet.create({
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatchWrap: { alignItems: 'center', gap: 4, width: 48 },
  swatch: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  swatchBorder: { borderColor: '#44444466' },
  swatchSelected: { borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 5 },
  swatchLabel: { fontSize: 9, fontFamily: 'Inter_400Regular', color: '#71717a', textAlign: 'center' },
  swatchLabelActive: { fontFamily: 'Inter_600SemiBold', color: '#6366f1' },
  sectionLabel: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  sectionSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  resetBtn: { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
});
