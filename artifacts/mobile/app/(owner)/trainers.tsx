import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StyledButton } from '@/components/StyledButton';
import { StyledInput } from '@/components/StyledInput';
import { EmptyState } from '@/components/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { addTrainer, removeTrainer } from '@/store';
import type { Trainer } from '@/types';

export default function TrainersScreen() {
  const colors = useColors();
  const { gym, session, refreshGym } = useAuth();
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', specialization: '', password: '' });

  const trainers = gym?.trainers ?? [];

  const handleAdd = async () => {
    if (!form.name || !form.phone || !form.password) {
      Alert.alert('Missing fields', 'Name, phone, and password are required.');
      return;
    }
    if (!session?.gymId) return;
    setLoading(true);
    try {
      await addTrainer(session.gymId, {
        name: form.name,
        phone: form.phone,
        specialization: form.specialization || undefined,
        password: form.password,
      });
      await refreshGym();
      setModal(false);
      setForm({ name: '', phone: '', specialization: '', password: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (trainer: Trainer) => {
    Alert.alert('Remove Trainer', `Remove ${trainer.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          if (!session?.gymId) return;
          await removeTrainer(session.gymId, trainer.id);
          await refreshGym();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={trainers}
        keyExtractor={t => t.id}
        contentContainerStyle={{ padding: 16, gap: 8, flexGrow: 1, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={[styles.avatar, { backgroundColor: colors.navTrainers + '33', borderRadius: 22 }]}>
              <Text style={{ color: colors.navTrainers, fontFamily: 'Inter_700Bold', fontSize: 16 }}>
                {item.name[0]?.toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.trainerName, { color: colors.foreground }]}>{item.name}</Text>
              <Text style={[styles.trainerSub, { color: colors.mutedForeground }]}>{item.phone}</Text>
              {item.specialization ? <Text style={[styles.trainerSub, { color: colors.mutedForeground }]}>{item.specialization}</Text> : null}
              <View style={[styles.idBadge, { backgroundColor: colors.secondary, borderRadius: 6 }]}>
                <Text style={[styles.idText, { color: colors.primary }]}>ID: {item.id}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleRemove(item)}>
              <Ionicons name="trash-outline" size={20} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState icon="person-outline" title="No trainers yet" subtitle="Add trainers to give them access" />
        }
      />

      <TouchableOpacity
        onPress={() => setModal(true)}
        style={[styles.fab, { backgroundColor: colors.navTrainers }]}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modal} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Trainer</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <View style={{ gap: 16 }}>
            <StyledInput label="Full Name *" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} placeholder="Trainer name" />
            <StyledInput label="Phone *" value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))} placeholder="Phone number" keyboardType="phone-pad" />
            <StyledInput label="Specialization" value={form.specialization} onChangeText={v => setForm(f => ({ ...f, specialization: v }))} placeholder="e.g. Strength, Yoga" />
            <StyledInput label="Password *" value={form.password} onChangeText={v => setForm(f => ({ ...f, password: v }))} placeholder="Set trainer login password" secureTextEntry />
            <StyledButton title="Add Trainer" onPress={handleAdd} loading={loading} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1 },
  avatar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  trainerName: { fontSize: 15, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  trainerSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  idBadge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start' },
  idText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  modal: { flex: 1, padding: 24, gap: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
});
