import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { MemberCard } from '@/components/MemberCard';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';

export default function TrainerMembersScreen() {
  const colors = useColors();
  const router = useRouter();
  const { gym, refreshGym } = useAuth();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshGym();
    setRefreshing(false);
  }, [refreshGym]);

  const planMap = Object.fromEntries((gym?.plans ?? []).map(p => [p.id, p.name]));
  const members = (gym?.members ?? [])
    .filter(m => m.status === 'active')
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search))
    .map(m => ({ ...m, planName: planMap[m.planId] ?? 'Unknown' }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.topBar}>
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
        <TouchableOpacity
          onPress={() => router.push('/(trainer)/members/new')}
          style={[styles.addBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={members}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        renderItem={({ item }) => (
          <MemberCard member={item} onPress={() => router.push(`/(trainer)/members/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState icon="people-outline" title={search ? 'No members found' : 'No active members'} />
        }
        scrollEnabled={!!members.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  addBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
});
