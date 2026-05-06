import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

interface Props {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}

export function SearchableDropdown({ label, value, onChange, options, placeholder, disabled }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [manualValue, setManualValue] = useState('');

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (val: string) => {
    onChange(val);
    setSearch('');
    setOpen(false);
    setManualMode(false);
  };

  const handleManualConfirm = () => {
    if (manualValue.trim()) {
      onChange(manualValue.trim());
      setManualValue('');
      setOpen(false);
      setManualMode(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TouchableOpacity
        onPress={() => { if (!disabled) setOpen(true); }}
        style={[
          styles.trigger,
          {
            backgroundColor: disabled ? colors.muted : colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
        activeOpacity={0.75}
      >
        <Text style={[styles.triggerText, { color: value ? colors.foreground : colors.mutedForeground }]}>
          {value || (placeholder ?? `Select ${label}`)}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === 'web' ? 24 : 16), paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select {label}</Text>
            <TouchableOpacity onPress={() => { setOpen(false); setSearch(''); setManualMode(false); setManualValue(''); }}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {!manualMode ? (
            <>
              <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
                <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder={`Search ${label}...`}
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.searchInput, { color: colors.foreground }]}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                onPress={() => { setManualMode(true); setSearch(''); }}
                style={[styles.manualBtn, { borderColor: colors.primary + '44', borderRadius: colors.radius }]}
              >
                <Ionicons name="create-outline" size={16} color={colors.primary} />
                <Text style={[styles.manualText, { color: colors.primary }]}>Type manually</Text>
              </TouchableOpacity>

              <FlatList
                data={filtered}
                keyExtractor={item => item}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    style={[
                      styles.option,
                      {
                        backgroundColor: value === item ? colors.primary + '22' : 'transparent',
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.optionText, { color: value === item ? colors.primary : colors.foreground }]}>{item}</Text>
                    {value === item && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyWrap}>
                    <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No results — try typing manually</Text>
                  </View>
                }
              />
            </>
          ) : (
            <View style={styles.manualWrap}>
              <Text style={[styles.manualLabel, { color: colors.mutedForeground }]}>Enter {label} name:</Text>
              <TextInput
                value={manualValue}
                onChangeText={setManualValue}
                placeholder={`Type ${label} name...`}
                placeholderTextColor={colors.mutedForeground}
                style={[styles.manualInput, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius, color: colors.foreground }]}
                autoFocus
                autoCapitalize="words"
              />
              <TouchableOpacity
                onPress={handleManualConfirm}
                style={[styles.confirmBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
              >
                <Text style={[styles.confirmText, { color: '#fff' }]}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setManualMode(false)}>
                <Text style={[styles.backLink, { color: colors.primary }]}>← Back to list</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1,
  },
  triggerText: { fontSize: 15, fontFamily: 'Inter_400Regular', flex: 1 },
  modal: { flex: 1, paddingHorizontal: 20, gap: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  manualBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderWidth: 1, alignSelf: 'flex-start' },
  manualText: { fontSize: 13, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: StyleSheet.hairlineWidth },
  optionText: { fontSize: 15, fontFamily: 'Inter_400Regular', flex: 1 },
  emptyWrap: { paddingVertical: 32, alignItems: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  manualWrap: { gap: 16, paddingTop: 8 },
  manualLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  manualInput: { paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: 'Inter_400Regular', borderWidth: 1 },
  confirmBtn: { paddingVertical: 14, alignItems: 'center' },
  confirmText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  backLink: { fontSize: 14, fontFamily: 'Inter_500Medium', textAlign: 'center' },
});
