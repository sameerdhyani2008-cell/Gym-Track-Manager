import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import { GradientBackground } from '@/components/GradientBackground';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { getTodayDateStr, toggleAttendance } from '@/store';

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
    <View style={pickerStyles.column}>
      <View style={[pickerStyles.selectionHighlight, { borderColor: colors.primary, borderRadius: 8 }]} pointerEvents="none" />
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
              style={[pickerStyles.columnItem, { height: ITEM_H }]}
              activeOpacity={0.6}
            >
              <Text style={[pickerStyles.columnText, { color: active ? colors.primary : colors.mutedForeground, fontFamily: active ? 'Inter_700Bold' : 'Inter_400Regular', fontSize: active ? 17 : 14 }]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

function formatDisplayDate(dateStr: string) {
  if (!dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
  const [y, m, d] = dateStr.split('-');
  const monthName = MONTHS[parseInt(m) - 1] ?? m;
  return `${parseInt(d)} ${monthName} ${y}`;
}

function shiftDate(dateStr: string, days: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function AttendanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { gym, session, refreshGym } = useAuth();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const today = getTodayDateStr();
  const [selectedDate, setSelectedDate] = useState(today);
  const [pickerOpen, setPickerOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  const parsedDate = selectedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const initYear = parsedDate ? parseInt(parsedDate[1]) : currentYear;
  const initMonth = parsedDate ? parseInt(parsedDate[2]) - 1 : new Date().getMonth();
  const initDay = parsedDate ? parseInt(parsedDate[3]) - 1 : new Date().getDate() - 1;

  const [selYear, setSelYear] = useState(years.indexOf(String(initYear)));
  const [selMonth, setSelMonth] = useState(initMonth);
  const [selDay, setSelDay] = useState(initDay);

  const selectedYearVal = parseInt(years[selYear] ?? String(currentYear));
  const daysInMonth = new Date(selectedYearVal, selMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

  const openPicker = () => {
    const p = selectedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (p) {
      setSelYear(years.indexOf(p[1]));
      setSelMonth(parseInt(p[2]) - 1);
      setSelDay(parseInt(p[3]) - 1);
    }
    setPickerOpen(true);
  };

  const confirmDate = () => {
    const y = years[selYear] ?? String(currentYear);
    const m = String(selMonth + 1).padStart(2, '0');
    const d = days[Math.min(selDay, days.length - 1)] ?? '01';
    setSelectedDate(`${y}-${m}-${d}`);
    setPickerOpen(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshGym();
    setRefreshing(false);
  }, [refreshGym]);

  const activeMembers = (gym?.members ?? []).filter(m => m.status === 'active');
  const filtered = activeMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search)
  );

  const presentCount = activeMembers.filter(m => m.attendanceDates.includes(selectedDate)).length;
  const isToday = selectedDate === today;

  const handleToggle = async (memberId: string) => {
    if (!session?.gymId) return;
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleAttendance(session.gymId, memberId, selectedDate);
    await refreshGym();
  };

  return (
    <GradientBackground>
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <View style={[styles.banner, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.bannerRow}>
          <TouchableOpacity onPress={() => setSelectedDate(shiftDate(selectedDate, -1))} style={styles.arrowBtn}>
            <Ionicons name="chevron-back" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity onPress={openPicker} style={styles.dateTapArea} activeOpacity={0.7}>
            <Text style={[styles.bannerTitle, { color: colors.foreground }]}>
              {formatDisplayDate(selectedDate)}
            </Text>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => !isToday && setSelectedDate(shiftDate(selectedDate, 1))}
            style={[styles.arrowBtn, { opacity: isToday ? 0.3 : 1 }]}
            disabled={isToday}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.bannerSub, { color: colors.mutedForeground }]}>
          {presentCount} / {activeMembers.length} present{isToday ? ' today' : ''}
        </Text>
      </View>

      <View style={[styles.searchRow, { paddingHorizontal: 16, paddingVertical: 12 }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search members..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => {
          const present = item.attendanceDates.includes(selectedDate);
          return (
            <TouchableOpacity
              onPress={() => handleToggle(item.id)}
              activeOpacity={0.75}
              style={[
                styles.row,
                {
                  backgroundColor: present ? colors.navAttendance + '11' : colors.card,
                  borderColor: present ? colors.navAttendance + '44' : colors.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={styles.left}>
                {item.photo ? (
                  <Image source={{ uri: item.photo }} style={[styles.avatar, { borderRadius: 22 }]} />
                ) : (
                  <View style={[styles.avatar, { borderRadius: 22, backgroundColor: colors.primary + '33', alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 16 }}>
                      {item.name[0]?.toUpperCase()}
                    </Text>
                  </View>
                )}
                <View>
                  <Text style={[styles.name, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.phone, { color: colors.mutedForeground }]}>{item.phone}</Text>
                </View>
              </View>
              <View style={[
                styles.checkCircle,
                {
                  backgroundColor: present ? colors.navAttendance : 'transparent',
                  borderColor: present ? colors.navAttendance : colors.border,
                  borderRadius: 16,
                },
              ]}>
                {present && <Ionicons name="checkmark" size={18} color="#fff" />}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-circle-outline"
            title={search ? 'No members found' : 'No active members'}
            subtitle="Active members will appear here"
          />
        }
        scrollEnabled={true}
      />

      <Modal visible={pickerOpen} animationType="slide" presentationStyle="formSheet">
        <View style={[pickerStyles.modal, { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === 'web' ? 24 : 16), paddingBottom: insets.bottom + 20 }]}>
          <View style={pickerStyles.modalHeader}>
            <Text style={[pickerStyles.modalTitle, { color: colors.foreground }]}>Select Date</Text>
            <TouchableOpacity onPress={() => setPickerOpen(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <View style={pickerStyles.scrollersWrap}>
            <View style={[pickerStyles.scrollersBox, { height: ITEM_H * VISIBLE }]}>
              <ScrollColumn items={days} selectedIndex={Math.min(selDay, days.length - 1)} onSelect={setSelDay} colors={colors} />
              <View style={[pickerStyles.divider, { backgroundColor: colors.border }]} />
              <ScrollColumn items={MONTHS} selectedIndex={selMonth} onSelect={setSelMonth} colors={colors} />
              <View style={[pickerStyles.divider, { backgroundColor: colors.border }]} />
              <ScrollColumn items={years} selectedIndex={selYear} onSelect={setSelYear} colors={colors} />
            </View>
            <View style={pickerStyles.labels}>
              {['Day', 'Month', 'Year'].map(l => (
                <Text key={l} style={[pickerStyles.colLabel, { color: colors.mutedForeground }]}>{l}</Text>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={confirmDate}
            style={[pickerStyles.confirmBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          >
            <Text style={[pickerStyles.confirmText, { color: '#fff' }]}>Confirm Date</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  banner: { padding: 16, borderBottomWidth: 1, gap: 4 },
  bannerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrowBtn: { padding: 4 },
  dateTapArea: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  bannerTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  bannerSub: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  searchRow: {},
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderWidth: 1, marginBottom: 8 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44 },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  phone: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  checkCircle: { width: 32, height: 32, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});

const pickerStyles = StyleSheet.create({
  modal: { flex: 1, paddingHorizontal: 24, gap: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
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
});
