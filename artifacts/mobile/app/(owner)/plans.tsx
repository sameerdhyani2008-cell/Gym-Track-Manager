import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
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
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', duration: '', price: '' });
  const [confirmDelete, setConfirmDelete] = useState<Plan | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const plans = gym?.plans ?? [];

  const handleAdd = async () => {
    setError('');
    if (!form.name.trim()) { setError('Plan name is required.'); return; }
    if (!form.duration.trim()) { setError('Duration is required.'); return; }
    if (!form.price.trim()) { setError('Price is required.'); return; }
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
    } catch {
      setError('Failed to create plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete || !session?.gymId) return;
    setDeleteLoading(true);
    try {
      await removePlan(session.gymId, confirmDelete.id);
      await refreshGym();
      setConfirmDelete(null);
    } finally {
      setDeleteLoading(false);
    }
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
            <TouchableOpacity onPress={() => setConfirmDelete(item)} style={{ padding: 4 }}>
              <Ionicons name="trash-outline" size={20} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState icon="pricetag-outline" title="No plans yet" subtitle="Create membership plans for your gym" />
        }
      />

      <TouchableOpacity
        onPress={() => { setModal(true); setError(''); }}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {confirmDelete && (
        <View style={[styles.overlay, { backgroundColor: colors.background + 'ee' }]}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: '#ef444444', borderRadius: colors.radius }]}>
            <Ionicons name="warning-outline" size={28} color="#ef4444" />
            <Text style={[styles.confirmTitle, { color: colors.foreground }]}>Delete Plan?</Text>
            <Text style={[styles.confirmSub, { color: colors.mutedForeground }]}>
              Delete "{confirmDelete.name}"? Members on this plan will not be affected.
            </Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity onPress={() => setConfirmDelete(null)} style={[styles.confirmNo, { borderColor: colors.border, borderRadius: colors.radius }]}>
                <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} disabled={deleteLoading} style={[styles.confirmYes, { backgroundColor: '#ef4444', borderRadius: colors.radius }]}>
                <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold' }}>{deleteLoading ? 'Deleting...' : 'Delete'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <Modal visible={modal} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Plan</Text>
            <TouchableOpacity onPress={() => { setModal(false); setError(''); }}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <View style={{ gap: 16 }}>
            <StyledInput label="Plan Name *" value={form.name} onChangeText={v => { setForm(f => ({ ...f, name: v })); setError(''); }} placeholder="e.g. Monthly, Quarterly" />
            <StyledInput label="Duration (months) *" value={form.duration} onChangeText={v => { setForm(f => ({ ...f, duration: v })); setError(''); }} placeholder="e.g. 1, 3, 12" keyboardType="numeric" />
            <StyledInput label="Price (₹) *" value={form.price} onChangeText={v => { setForm(f => ({ ...f, price: v })); setError(''); }} placeholder="e.g. 1000" keyboardType="numeric" />
            {error ? (
              <View style={[{ padding: 12, borderWidth: 1, borderRadius: colors.radius, backgroundColor: '#ef444422', borderColor: '#ef444444' }]}>
                <Text style={{ color: '#ef4444', fontFamily: 'Inter_500Medium', fontSize: 14 }}>{error}</Text>
              </View>
            ) : null}
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
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', padding: 24 },
  confirmCard: { width: '100%', padding: 24, borderWidth: 1, gap: 12, alignItems: 'center' },
  confirmTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  confirmSub: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  confirmBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmNo: { flex: 1, paddingVertical: 12, alignItems: 'center', borderWidth: 1 },
  confirmYes: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  modal: { flex: 1, padding: 24, gap: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
});
