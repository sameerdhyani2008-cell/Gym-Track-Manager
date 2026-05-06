import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StyledButton } from '@/components/StyledButton';
import { StyledInput } from '@/components/StyledInput';
import { useAuth } from '@/context/AuthContext';
import { useColors } from '@/hooks/useColors';
import { addMember } from '@/store';

type PayMethod = 'cash' | 'upi' | 'card' | 'other';

export default function AddMemberScreen() {
  const colors = useColors();
  const router = useRouter();
  const { gym, session, refreshGym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    medicalInfo: '',
    planId: '',
    startDate: new Date().toISOString().slice(0, 10),
    amountPaid: '',
    paymentMethod: 'cash' as PayMethod,
  });

  const update = (key: keyof typeof form) => (val: string) =>
    setForm(f => ({ ...f, [key]: val }));

  const selectedPlan = gym?.plans.find(p => p.id === form.planId);

  const endDate = (() => {
    if (!selectedPlan || !form.startDate) return '';
    const d = new Date(form.startDate);
    d.setMonth(d.getMonth() + selectedPlan.duration);
    return d.toISOString().slice(0, 10);
  })();

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission needed'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleAdd = async () => {
    if (!form.name || !form.phone || !form.planId) {
      Alert.alert('Missing fields', 'Name, phone, and plan are required.');
      return;
    }
    if (!session?.gymId) return;
    setLoading(true);
    try {
      await addMember(session.gymId, {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        medicalInfo: form.medicalInfo || undefined,
        planId: form.planId,
        planName: selectedPlan?.name,
        startDate: form.startDate,
        endDate,
        status: 'active',
        paymentMethod: form.paymentMethod,
        amountPaid: Number(form.amountPaid) || 0,
        photo: photo || undefined,
      });
      await refreshGym();
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={pickPhoto} style={[styles.photoBtn, { borderColor: colors.border, borderRadius: 44, backgroundColor: colors.card }]}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photo} />
          ) : (
            <Text style={[styles.photoPlaceholder, { color: colors.mutedForeground }]}>Add Photo</Text>
          )}
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Personal Info</Text>
          <StyledInput label="Full Name *" value={form.name} onChangeText={update('name')} placeholder="Member name" />
          <StyledInput label="Phone *" value={form.phone} onChangeText={update('phone')} placeholder="Phone number" keyboardType="phone-pad" />
          <StyledInput label="Email" value={form.email} onChangeText={update('email')} placeholder="Email (optional)" keyboardType="email-address" autoCapitalize="none" />
          <StyledInput label="Date of Birth" value={form.dateOfBirth} onChangeText={update('dateOfBirth')} placeholder="YYYY-MM-DD" />
          <StyledInput label="Medical Info" value={form.medicalInfo} onChangeText={update('medicalInfo')} placeholder="Any medical conditions" multiline numberOfLines={3} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Membership</Text>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Select Plan *</Text>
          <View style={styles.planGrid}>
            {(gym?.plans ?? []).map(plan => (
              <TouchableOpacity
                key={plan.id}
                onPress={() => update('planId')(plan.id)}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: form.planId === plan.id ? colors.primary : colors.card,
                    borderColor: form.planId === plan.id ? colors.primary : colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <Text style={[styles.planName, { color: form.planId === plan.id ? '#fff' : colors.foreground }]}>{plan.name}</Text>
                <Text style={[styles.planDur, { color: form.planId === plan.id ? '#fff99' : colors.mutedForeground }]}>{plan.duration}M</Text>
                <Text style={[styles.planPrice, { color: form.planId === plan.id ? '#fff' : colors.primary }]}>₹{plan.price}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <StyledInput label="Start Date" value={form.startDate} onChangeText={update('startDate')} placeholder="YYYY-MM-DD" />
          {endDate ? <Text style={[styles.endDate, { color: colors.mutedForeground }]}>End Date: {endDate}</Text> : null}

          <StyledInput
            label="Amount Paid (₹)"
            value={form.amountPaid}
            onChangeText={update('amountPaid')}
            placeholder={selectedPlan ? String(selectedPlan.price) : '0'}
            keyboardType="numeric"
          />

          <Text style={[styles.label, { color: colors.mutedForeground }]}>Payment Method</Text>
          <View style={styles.payRow}>
            {(['cash', 'upi', 'card', 'other'] as PayMethod[]).map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => setForm(f => ({ ...f, paymentMethod: m }))}
                style={[
                  styles.payBtn,
                  {
                    backgroundColor: form.paymentMethod === m ? colors.primary : colors.card,
                    borderColor: form.paymentMethod === m ? colors.primary : colors.border,
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <Text style={[styles.payText, { color: form.paymentMethod === m ? '#fff' : colors.foreground }]}>
                  {m.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
  planGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  planCard: { padding: 12, borderWidth: 1, minWidth: 90, alignItems: 'center', gap: 4 },
  planName: { fontSize: 13, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
  planDur: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  planPrice: { fontSize: 15, fontFamily: 'Inter_700Bold', fontWeight: '700' as const },
  endDate: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  payRow: { flexDirection: 'row', gap: 8 },
  payBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderWidth: 1 },
  payText: { fontSize: 11, fontFamily: 'Inter_600SemiBold', fontWeight: '600' as const },
});
