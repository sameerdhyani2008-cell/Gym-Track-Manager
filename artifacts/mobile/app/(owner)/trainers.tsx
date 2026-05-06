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
import { addTrainer, removeTrainer } from '@/store';
import type { Trainer } from '@/types';

export default function TrainersScreen() {
  const colors = useColors();
  const { gym, session, refreshGym } = useAuth();
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', specialization: '', password: '' });
  const [confirmRemove, setConfirmRemove] = useState<Trainer | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const trainers = gym?.trainers ?? [];

  const handleAdd = async () => {
    setError('');
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.phone.trim()) { setError('Phone is required.'); return; }
    if (!form.password.trim()) { setError('Password is required.'); return; }
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
    } catch {
      setError('Failed to add trainer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirmRemove || !session?.gymId) return;
    setRemoveLoading(true);
    try {
      await removeTrainer(session.gymId, confirmRemove.id);
      await refreshGym();
      setConfirmRemove(null);
    } finally {
      setRemoveLoading(false);
    }
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
            <TouchableOpacity onPress={() => setConfirmRemove(item)} style={{ padding: 4 }}>
              <Ionicons name="trash-outline" size={20} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState icon="person-outline" title="No trainers yet" subtitle="Add trainers to give them access" />
        }
      />

      <TouchableOpacity
        onPress={() => { setModal(true); setError(''); }}
        style={[styles.fab, { backgroundColor: colors.navTrainers }]}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Remove confirmation inline overlay */}
      {confirmRemove && (
        <View style={[styles.overlay, { backgroundColor: colors.background + 'ee' }]}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: '#ef444444', borderRadius: colors.radius }]}>
            <Ionicons name="warning-outline" size={28} color="#ef4444" />
            <Text style={[styles.confirmTitle, { color: colors.foreground }]}>Remove Trainer?</Text>
            <Text style={[styles.confirmSub, { color: colors.mutedForeground }]}>
              Remove {confirmRemove.name} from your gym? They will lose access.
            </Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity onPress={() => setConfirmRemove(null)} style={[styles.confirmNo, { borderColor: colors.border, borderRadius: colors.radius }]}>
                <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRemove} disabled={removeLoading} style={[styles.confirmYes, { backgroundColor: '#ef4444', borderRadius: colors.radius }]}>
                <Text style={{ color: '#fff', fontFamily: 'Inter_600SemiBold' }}>{removeLoading ? 'Removing...' : 'Remove'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <Modal visible={modal} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Trainer</Text>
            <TouchableOpacity onPress={() => { setModal(false); setError(''); }}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <View style={{ gap: 16 }}>
            <StyledInput label="Full Name *" value={form.name} onChangeText={v => { setForm(f => ({ ...f, name: v })); setError(''); }} placeholder="Trainer name" />
            <StyledInput label="Phone *" value={form.phone} onChangeText={v => { setForm(f => ({ ...f, phone: v })); setError(''); }} placeholder="Phone number" keyboardType="phone-pad" />
            <StyledInput label="Specialization" value={form.specialization} onChangeText={v => setForm(f => ({ ...f, specialization: v }))} placeholder="e.g. Strength, Yoga" />
            <StyledInput label="Password *" value={form.password} onChangeText={v => { setForm(f => ({ ...f, password: v })); setError(''); }} placeholder="Set trainer login password" secureTextEntry />
            {error ? (
              <View style={[{ padding: 12, borderWidth: 1, borderRadius: colors.radius, backgroundColor: '#ef444422', borderColor: '#ef444444' }]}>
                <Text style={{ color: '#ef4444', fontFamily: 'Inter_500Medium', fontSize: 14 }}>{error}</Text>
              </View>
            ) : null}
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
