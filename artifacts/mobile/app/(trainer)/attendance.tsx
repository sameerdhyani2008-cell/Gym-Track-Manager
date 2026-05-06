import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { getTodayDateStr, toggleAttendance } from '@/store';

export default function TrainerAttendanceScreen() {
  const colors = useColors();
  const { gym, session, refreshGym } = useAuth();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const today = getTodayDateStr();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshGym();
    setRefreshing(false);
  }, [refreshGym]);

  const activeMembers = (gym?.members ?? []).filter(m => m.status === 'active');
  const filtered = activeMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search)
  );
  const presentCount = activeMembers.filter(m => m.attendanceDates.includes(today)).length;

  const handleToggle = async (memberId: string) => {
    if (!session?.gymId) return;
    if (Platform.OS !== 'web') await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleAttendance(session.gymId, memberId, today);
    await refreshGym();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.banner, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.bannerTitle, { color: colors.foreground }]}>{today}</Text>
        <Text style={[styles.bannerSub, { color: colors.mutedForeground }]}>
          {presentCount} / {activeMembers.length} present
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
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
          const present = item.attendanceDates.includes(today);
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
          <EmptyState icon="checkmark-circle-outline" title={search ? 'No members found' : 'No active members'} subtitle="Active members appear here" />
        }
        scrollEnabled={!!filtered.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { padding: 16, borderBottomWidth: 1, gap: 2 },
  bannerTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  bannerSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderWidth: 1, marginBottom: 8 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44 },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  phone: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  checkCircle: { width: 32, height: 32, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
