import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
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
  onChange: (date: string) => void;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ITEM_H = 48;
const VISIBLE = 5;

function ScrollColumn({
  items,
  selectedIndex,
  onSelect,
  colors,
}: {
  items: string[];
  selectedIndex: number;
  onSelect: (idx: number) => void;
  colors: ReturnType<typeof useColors>;
}) {
  const ref = useRef<FlatList<string>>(null);

  useEffect(() => {
    if (ref.current && selectedIndex >= 0) {
      ref.current.scrollToIndex({ index: selectedIndex, animated: true, viewPosition: 0.5 });
    }
  }, [selectedIndex]);

  return (
    <View style={styles.column}>
      <View style={[styles.selectionHighlight, { borderColor: colors.primary, borderRadius: colors.radius }]} pointerEvents="none" />
      <FlatList
        ref={ref}
        data={items}
        keyExtractor={(_, i) => String(i)}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_H * Math.floor(VISIBLE / 2) }}
        onMomentumScrollEnd={e => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
          onSelect(Math.max(0, Math.min(idx, items.length - 1)));
        }}
        initialScrollIndex={Math.max(0, selectedIndex)}
        getItemLayout={(_, index) => ({ length: ITEM_H, offset: ITEM_H * index, index })}
        renderItem={({ item, index }) => {
          const active = index === selectedIndex;
          return (
            <TouchableOpacity
              onPress={() => onSelect(index)}
              style={[styles.columnItem, { height: ITEM_H }]}
              activeOpacity={0.6}
            >
              <Text style={[styles.columnText, { color: active ? colors.primary : colors.mutedForeground, fontFamily: active ? 'Inter_700Bold' : 'Inter_400Regular', fontSize: active ? 17 : 14 }]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

export function DatePickerInput({ label, value, onChange }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [manualText, setManualText] = useState(value);

  const parsedDate = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const initYear = parsedDate ? parseInt(parsedDate[1]) : new Date().getFullYear();
  const initMonth = parsedDate ? parseInt(parsedDate[2]) - 1 : 0;
  const initDay = parsedDate ? parseInt(parsedDate[3]) - 1 : 0;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));
  const months = MONTHS;

  const [selYear, setSelYear] = useState(years.indexOf(String(initYear)));
  const [selMonth, setSelMonth] = useState(initMonth);
  const [selDay, setSelDay] = useState(initDay);

  const selectedYear = parseInt(years[selYear] ?? String(currentYear));
  const daysInMonth = new Date(selectedYear, selMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

  const handleConfirm = () => {
    const y = years[selYear] ?? String(currentYear);
    const m = String(selMonth + 1).padStart(2, '0');
    const d = days[Math.min(selDay, days.length - 1)] ?? '01';
    onChange(`${y}-${m}-${d}`);
    setOpen(false);
    setManualMode(false);
  };

  const handleManualConfirm = () => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(manualText)) {
      onChange(manualText);
      setOpen(false);
      setManualMode(false);
    }
  };

  return (
    <View style={{ gap: 6 }}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TouchableOpacity
        onPress={() => { setManualText(value); setOpen(true); }}
        style={[styles.trigger, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}
        activeOpacity={0.75}
      >
        <Text style={[styles.triggerText, { color: value ? colors.foreground : colors.mutedForeground }]}>
          {value || 'Select date of birth'}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === 'web' ? 24 : 16), paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{label}</Text>
            <TouchableOpacity onPress={() => { setOpen(false); setManualMode(false); }}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setManualMode(!manualMode)}
            style={[styles.toggleMode, { borderColor: colors.primary + '44', borderRadius: colors.radius }]}
          >
            <Ionicons name={manualMode ? 'apps-outline' : 'create-outline'} size={16} color={colors.primary} />
            <Text style={[styles.toggleModeText, { color: colors.primary }]}>
              {manualMode ? 'Use scroll picker' : 'Type date manually'}
            </Text>
          </TouchableOpacity>

          {!manualMode ? (
            <>
              <View style={styles.scrollersWrap}>
                <View style={[styles.scrollersBox, { height: ITEM_H * VISIBLE }]}>
                  <ScrollColumn items={days} selectedIndex={Math.min(selDay, days.length - 1)} onSelect={setSelDay} colors={colors} />
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <ScrollColumn items={months} selectedIndex={selMonth} onSelect={setSelMonth} colors={colors} />
                  <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  <ScrollColumn items={years} selectedIndex={selYear} onSelect={setSelYear} colors={colors} />
                </View>
                <View style={styles.labels}>
                  {['Day', 'Month', 'Year'].map(l => (
                    <Text key={l} style={[styles.colLabel, { color: colors.mutedForeground }]}>{l}</Text>
                  ))}
                </View>
              </View>
              <TouchableOpacity
                onPress={handleConfirm}
                style={[styles.confirmBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
              >
                <Text style={[styles.confirmText, { color: '#fff' }]}>Confirm Date</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ gap: 16 }}>
              <Text style={[styles.manualHint, { color: colors.mutedForeground }]}>Enter date in YYYY-MM-DD format</Text>
              <TextInput
                value={manualText}
                onChangeText={setManualText}
                placeholder="e.g. 1995-06-15"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.manualInput, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius, color: colors.foreground }]}
                keyboardType="numeric"
                maxLength={10}
                autoFocus
              />
              <TouchableOpacity
                onPress={handleManualConfirm}
                style={[styles.confirmBtn, { backgroundColor: /^\d{4}-\d{2}-\d{2}$/.test(manualText) ? colors.primary : colors.muted, borderRadius: colors.radius }]}
              >
                <Text style={[styles.confirmText, { color: '#fff' }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  trigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1 },
  triggerText: { fontSize: 15, fontFamily: 'Inter_400Regular', flex: 1 },
  modal: { flex: 1, paddingHorizontal: 24, gap: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  toggleMode: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderWidth: 1, alignSelf: 'flex-start' },
  toggleModeText: { fontSize: 13, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  scrollersWrap: { gap: 8 },
  scrollersBox: { flexDirection: 'row', overflow: 'hidden' },
  column: { flex: 1, position: 'relative', overflow: 'hidden' },
  selectionHighlight: { position: 'absolute', top: '50%', left: 4, right: 4, height: ITEM_H, marginTop: -ITEM_H / 2, borderWidth: 1.5, zIndex: 1 },
  columnItem: { alignItems: 'center', justifyContent: 'center' },
  columnText: { textAlign: 'center' },
  divider: { width: 1 },
  labels: { flexDirection: 'row' },
  colLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontFamily: 'Inter_500Medium' },
  confirmBtn: { paddingVertical: 14, alignItems: 'center' },
  confirmText: { fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  manualHint: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  manualInput: { paddingHorizontal: 14, paddingVertical: 12, fontSize: 17, fontFamily: 'Inter_400Regular', borderWidth: 1, letterSpacing: 2 },
});
