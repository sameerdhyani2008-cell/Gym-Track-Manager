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
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { addRevenue, getTodayDateStr } from '@/store';
import type { RevenueEntry } from '@/types';

type PayMethod = 'cash' | 'upi' | 'card' | 'other';

export default function RevenueScreen() {
  const colors = useColors();
  const { gym, session, refreshGym } = useAuth();
  const [modal, setModal] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [form, setForm] = useState({ description: '', amount: '', paymentMethod: 'cash' as PayMethod });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const revenues = (gym?.revenues ?? []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const totalIncome = revenues.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);
  const totalExpenses = revenues.filter(r => r.type === 'expense').reduce((s, r) => s + r.amount, 0);
  const net = totalIncome - totalExpenses;

  const payBreakdown = (['cash', 'upi', 'card', 'other'] as PayMethod[]).map(m => ({
    method: m,
    amount: revenues.filter(r => r.type === 'income' && r.paymentMethod === m).reduce((s, r) => s + r.amount, 0),
  })).filter(b => b.amount > 0);

  const handleAdd = async () => {
    setError('');
    if (!form.description.trim()) { setError('Description is required.'); return; }
    if (!form.amount.trim() || isNaN(Number(form.amount))) { setError('Enter a valid amount.'); return; }
    if (!session?.gymId) return;
    setLoading(true);
    try {
      await addRevenue(session.gymId, {
        type,
        description: form.description,
        amount: Number(form.amount),
        date: getTodayDateStr(),
        paymentMethod: form.paymentMethod,
      });
      await refreshGym();
      setModal(false);
      setForm({ description: '', amount: '', paymentMethod: 'cash' });
    } catch {
      setError('Failed to add entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: RevenueEntry }) => (
    <View style={[styles.entry, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
      <View style={[styles.entryIcon, { backgroundColor: item.type === 'income' ? '#22c55e22' : '#ef444422', borderRadius: 8 }]}>
        <Ionicons name={item.type === 'income' ? 'arrow-down' : 'arrow-up'} size={16} color={item.type === 'income' ? '#22c55e' : '#ef4444'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.entryDesc, { color: colors.foreground }]}>{item.description}</Text>
        <Text style={[styles.entryDate, { color: colors.mutedForeground }]}>{item.date} · {item.paymentMethod}</Text>
      </View>
      <Text style={[styles.entryAmount, { color: item.type === 'income' ? '#22c55e' : '#ef4444' }]}>
        {item.type === 'income' ? '+' : '-'}₹{item.amount.toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={revenues}
        keyExtractor={r => r.id}
        contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: '#22c55e22', borderRadius: colors.radius }]}>
                <Text style={[styles.statLabel, { color: '#22c55e' }]}>Income</Text>
                <Text style={[styles.statVal, { color: '#22c55e' }]}>₹{totalIncome.toLocaleString()}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#ef444422', borderRadius: colors.radius }]}>
                <Text style={[styles.statLabel, { color: '#ef4444' }]}>Expenses</Text>
                <Text style={[styles.statVal, { color: '#ef4444' }]}>₹{totalExpenses.toLocaleString()}</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.primary + '22', borderRadius: colors.radius }]}>
                <Text style={[styles.statLabel, { color: colors.primary }]}>Net</Text>
                <Text style={[styles.statVal, { color: colors.primary }]}>₹{net.toLocaleString()}</Text>
              </View>
            </View>

            {payBreakdown.length > 0 && (
              <View style={[styles.breakdown, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
                <Text style={[styles.breakTitle, { color: colors.foreground }]}>Payment Methods</Text>
                {payBreakdown.map(b => (
                  <View key={b.method} style={styles.breakRow}>
                    <Text style={[styles.breakMethod, { color: colors.mutedForeground }]}>{b.method.toUpperCase()}</Text>
                    <Text style={[styles.breakAmt, { color: colors.foreground }]}>₹{b.amount.toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text style={[styles.listTitle, { color: colors.foreground }]}>All Transactions</Text>
          </>
        }
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.mutedForeground }]}>No transactions yet</Text>
        }
      />

      <TouchableOpacity onPress={() => { setModal(true); setError(''); }} style={[styles.fab, { backgroundColor: colors.primary }]}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modal} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Entry</Text>
            <TouchableOpacity onPress={() => { setModal(false); setError(''); }}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <View style={[styles.typeTabs, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
            {(['income', 'expense'] as const).map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => { setType(t); setError(''); }}
                style={[styles.typeTab, { borderRadius: colors.radius - 2 }, type === t && { backgroundColor: t === 'income' ? '#22c55e' : '#ef4444' }]}
              >
                <Text style={[styles.typeTabText, { color: type === t ? '#fff' : colors.mutedForeground }]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ gap: 16 }}>
            <StyledInput label="Description" value={form.description} onChangeText={v => { setForm(f => ({ ...f, description: v })); setError(''); }} placeholder="What is this for?" />
            <StyledInput label="Amount (₹)" value={form.amount} onChangeText={v => { setForm(f => ({ ...f, amount: v })); setError(''); }} placeholder="0" keyboardType="numeric" />
            <View style={{ gap: 8 }}>
              <Text style={[{ color: colors.mutedForeground, fontSize: 13, fontFamily: 'Inter_500Medium' }]}>Payment Method</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['cash', 'upi', 'card', 'other'] as PayMethod[]).map(m => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setForm(f => ({ ...f, paymentMethod: m }))}
                    style={[{ flex: 1, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderRadius: colors.radius, backgroundColor: form.paymentMethod === m ? colors.primary : colors.card, borderColor: form.paymentMethod === m ? colors.primary : colors.border }]}
                  >
                    <Text style={[{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: form.paymentMethod === m ? '#fff' : colors.foreground }]}>{m.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {error ? (
              <View style={[{ padding: 12, borderWidth: 1, borderRadius: colors.radius, backgroundColor: '#ef444422', borderColor: '#ef444444' }]}>
                <Text style={{ color: '#ef4444', fontFamily: 'Inter_500Medium', fontSize: 14 }}>{error}</Text>
              </View>
            ) : null}
            <StyledButton title="Add Entry" onPress={handleAdd} loading={loading} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: { flex: 1, padding: 14, gap: 4, alignItems: 'center' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  statVal: { fontSize: 18, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  breakdown: { padding: 16, borderWidth: 1, gap: 10, marginBottom: 16 },
  breakTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  breakRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakMethod: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  breakAmt: { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  listTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: '700' as const, marginBottom: 8 },
  entry: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, marginBottom: 8 },
  entryIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  entryDesc: { fontSize: 14, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  entryDate: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  entryAmount: { fontSize: 15, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  empty: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingTop: 40 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  modal: { flex: 1, padding: 24, gap: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  typeTabs: { flexDirection: 'row', padding: 4 },
  typeTab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  typeTabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
});
