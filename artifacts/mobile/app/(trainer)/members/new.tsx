import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DatePickerInput } from '@/components/DatePickerInput';
import { StyledButton } from '@/components/StyledButton';
import { StyledInput } from '@/components/StyledInput';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { addMember } from '@/store';

type PayMethod = 'cash' | 'upi' | 'card' | 'other';
const BLOOD_TYPES = ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', 'Unknown'];

export default function TrainerAddMemberScreen() {
  const colors = useColors();
  const router = useRouter();
  const { gym, session, refreshGym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photo, setPhoto] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    medicalConditions: '',
    previousInjuries: '',
    bloodType: '',
    allergies: '',
    planId: '',
    startDate: new Date().toISOString().slice(0, 10),
    amountPaid: '',
    paymentMethod: 'cash' as PayMethod,
  });

  const update = (key: keyof typeof form) => (val: string) => {
    setError('');
    setForm(f => ({ ...f, [key]: val }));
  };

  const selectedPlan = gym?.plans.find(p => p.id === form.planId);
  const endDate = (() => {
    if (!selectedPlan || !form.startDate) return '';
    const d = new Date(form.startDate);
    d.setMonth(d.getMonth() + selectedPlan.duration);
    return d.toISOString().slice(0, 10);
  })();

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleAdd = async () => {
    setError('');
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.phone.trim()) { setError('Phone number is required.'); return; }
    if (!form.planId) { setError('Please select a membership plan.'); return; }
    if (!session?.gymId) return;
    setLoading(true);
    try {
      await addMember(session.gymId, {
        name: form.name, phone: form.phone,
        email: form.email || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        medicalConditions: form.medicalConditions || undefined,
        previousInjuries: form.previousInjuries || undefined,
        bloodType: form.bloodType || undefined,
        allergies: form.allergies || undefined,
        planId: form.planId, planName: selectedPlan?.name,
        startDate: form.startDate, endDate, status: 'active',
        paymentMethod: form.paymentMethod,
        amountPaid: Number(form.amountPaid) || 0,
        photo: photo || undefined,
      });
      await refreshGym();
      router.back();
    } catch {
      setError('Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={pickPhoto} style={[styles.photoBtn, { borderColor: colors.border, borderRadius: 44, backgroundColor: colors.card }]}>
          {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : <Text style={[styles.photoPlaceholder, { color: colors.mutedForeground }]}>Add Photo</Text>}
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Personal Info</Text>
          <StyledInput label="Full Name *" value={form.name} onChangeText={update('name')} placeholder="Member name" />
          <StyledInput label="Phone *" value={form.phone} onChangeText={update('phone')} placeholder="Phone number" keyboardType="phone-pad" />
          <StyledInput label="Email" value={form.email} onChangeText={update('email')} placeholder="Email (optional)" keyboardType="email-address" autoCapitalize="none" />
          <DatePickerInput label="Date of Birth" value={form.dateOfBirth} onChange={update('dateOfBirth')} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Medical Details</Text>
          <View style={{ gap: 8 }}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Blood Type</Text>
            <View style={styles.bloodRow}>
              {BLOOD_TYPES.map(bt => (
                <TouchableOpacity
                  key={bt}
                  onPress={() => setForm(f => ({ ...f, bloodType: f.bloodType === bt ? '' : bt }))}
                  style={[styles.bloodBtn, { backgroundColor: form.bloodType === bt ? colors.primary : colors.card, borderColor: form.bloodType === bt ? colors.primary : colors.border, borderRadius: colors.radius }]}
                >
                  <Text style={[styles.bloodText, { color: form.bloodType === bt ? '#fff' : colors.foreground }]}>{bt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <StyledInput label="Medical Conditions" value={form.medicalConditions} onChangeText={update('medicalConditions')} placeholder="e.g. Diabetes, Hypertension, Asthma..." multiline numberOfLines={3} />
          <StyledInput label="Previous Injuries" value={form.previousInjuries} onChangeText={update('previousInjuries')} placeholder="e.g. Knee ligament tear (2022), Back injury..." multiline numberOfLines={3} />
          <StyledInput label="Allergies" value={form.allergies} onChangeText={update('allergies')} placeholder="e.g. Peanuts, Penicillin, Latex..." multiline numberOfLines={2} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Membership</Text>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Select Plan *</Text>
          {(gym?.plans ?? []).length === 0 ? (
            <View style={[styles.noPlans, { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius }]}>
              <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 14 }}>No plans available.</Text>
            </View>
          ) : (
            <View style={styles.planGrid}>
              {(gym?.plans ?? []).map(plan => (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => { setError(''); setForm(f => ({ ...f, planId: plan.id })); }}
                  style={[styles.planCard, { backgroundColor: form.planId === plan.id ? colors.primary : colors.card, borderColor: form.planId === plan.id ? colors.primary : colors.border, borderRadius: colors.radius }]}
                >
                  <Text style={[styles.planName, { color: form.planId === plan.id ? '#fff' : colors.foreground }]}>{plan.name}</Text>
                  <Text style={[styles.planPrice, { color: form.planId === plan.id ? '#fff' : colors.primary }]}>₹{plan.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <StyledInput label="Start Date" value={form.startDate} onChangeText={update('startDate')} placeholder="YYYY-MM-DD" />
          {endDate ? (
            <View style={[styles.endDateRow, { backgroundColor: '#22c55e11', borderColor: '#22c55e33', borderRadius: colors.radius }]}>
              <Text style={{ color: '#22c55e', fontFamily: 'Inter_500Medium', fontSize: 13 }}>📅 Expires: {endDate}</Text>
            </View>
          ) : null}
          <StyledInput label="Amount Paid (₹)" value={form.amountPaid} onChangeText={update('amountPaid')} placeholder="0" keyboardType="numeric" />
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Payment Method</Text>
          <View style={styles.payRow}>
            {(['cash', 'upi', 'card', 'other'] as PayMethod[]).map(m => (
              <TouchableOpacity key={m} onPress={() => setForm(f => ({ ...f, paymentMethod: m }))} style={[styles.payBtn, { backgroundColor: form.paymentMethod === m ? colors.primary : colors.card, borderColor: form.paymentMethod === m ? colors.primary : colors.border, borderRadius: colors.radius }]}>
                <Text style={[{ fontSize: 11, fontFamily: 'Inter_600SemiBold', color: form.paymentMethod === m ? '#fff' : colors.foreground }]}>{m.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: '#ef444422', borderColor: '#ef444444', borderRadius: colors.radius }]}>
            <Text style={{ color: '#ef4444', fontFamily: 'Inter_500Medium', fontSize: 14 }}>{error}</Text>
          </View>
        ) : null}

        <StyledButton title="Add Member" onPress={handleAdd} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 20, paddingBottom: 40 },
  photoBtn: { alignSelf: 'center', width: 88, height: 88, borderWidth: 2, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photo: { width: 88, height: 88 },
  photoPlaceholder: { fontSize: 11, fontFamily: 'Inter_500Medium', textAlign: 'center' },
  section: { gap: 14 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium', fontWeight: '500' as const },
  bloodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bloodBtn: { paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, minWidth: 52, alignItems: 'center' },
  bloodText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  noPlans: { padding: 14, borderWidth: 1 },
  planGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  planCard: { padding: 12, borderWidth: 1, minWidth: 90, alignItems: 'center', gap: 4 },
  planName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  planPrice: { fontSize: 15, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  endDateRow: { padding: 10, borderWidth: 1 },
  payRow: { flexDirection: 'row', gap: 8 },
  payBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderWidth: 1 },
  errorBox: { padding: 14, borderWidth: 1 },
});
