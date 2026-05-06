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
import { addPlan, removePlan } from '@/store';
import type { Plan } from '@/types';

export default function PlansScreen() {
  const colors = useColors();
  const { gym, session, refreshGym } = useAuth();
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', duration: '', price: '' });

  const plans = gym?.plans ?? [];

  const handleAdd = async () => {
    if (!form.name || !form.duration || !form.price) {
      Alert.alert('Missing fields', 'All fields are required.');
      return;
    }
    if (!session?.gymId) return;
    setLoading(true);
    try {
      await addPlan(session.gymId, {
        name: form.name,
        duration: Number(form.duration),
        price: Number(form.price),
      });
      await refreshGym();
      setModal(false);
      setForm({ name: '', duration: '', price: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (plan: Plan) => {
    Alert.alert('Delete Plan', `Delete "${plan.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          if (!session?.gymId) return;
          await removePlan(session.gymId, plan.id);
          await refreshGym();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={plans}
        keyExtractor={p => p.id}
        contentContainerStyle={{ padding: 16, gap: 8, flexGrow: 1, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.planName, { color: colors.foreground }]}>{item.name}</Text>
              <Text style={[styles.planSub, { color: colors.mutedForeground }]}>{item.duration} month{item.duration > 1 ? 's' : ''}</Text>
            </View>
            <Text style={[styles.planPrice, { color: colors.primary }]}>₹{item.price.toLocaleString()}</Text>
            <TouchableOpacity onPress={() => handleRemove(item)} style={{ padding: 4 }}>
              <Ionicons name="trash-outline" size={20} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState icon="pricetag-outline" title="No plans yet" subtitle="Create membership plans for your gym" />
        }
      />

      <TouchableOpacity
        onPress={() => setModal(true)}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modal} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Plan</Text>
            <TouchableOpacity onPress={() => setModal(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <View style={{ gap: 16 }}>
            <StyledInput label="Plan Name *" value={form.name} onChangeText={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Monthly, Quarterly" />
            <StyledInput label="Duration (months) *" value={form.duration} onChangeText={v => setForm(f => ({ ...f, duration: v }))} placeholder="e.g. 1, 3, 12" keyboardType="numeric" />
            <StyledInput label="Price (₹) *" value={form.price} onChangeText={v => setForm(f => ({ ...f, price: v }))} placeholder="e.g. 1000" keyboardType="numeric" />
            <StyledButton title="Create Plan" onPress={handleAdd} loading={loading} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderWidth: 1 },
  planName: { fontSize: 16, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  planSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  planPrice: { fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  modal: { flex: 1, padding: 24, gap: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
});
