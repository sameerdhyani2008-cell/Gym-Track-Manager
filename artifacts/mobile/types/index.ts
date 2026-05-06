export interface Plan {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  photo?: string;
  dateOfBirth?: string;
  // Structured medical fields
  medicalConditions?: string;
  previousInjuries?: string;
  bloodType?: string;
  allergies?: string;
  // Legacy single field (kept for backwards compat)
  medicalInfo?: string;
  planId: string;
  planName?: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  paymentMethod: 'cash' | 'upi' | 'card' | 'other';
  amountPaid: number;
  attendanceDates: string[];
}

export interface Trainer {
  id: string;
  name: string;
  phone: string;
  specialization?: string;
  password: string;
  gymId: string;
}

export interface RevenueEntry {
  id: string;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
  paymentMethod: 'cash' | 'upi' | 'card' | 'other';
  memberId?: string;
}

export interface Gym {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPhone: string;
  city: string;
  state: string;
  password: string;
  plan: 'free' | 'pro';
  plans: Plan[];
  members: Member[];
  trainers: Trainer[];
  revenues: RevenueEntry[];
  createdAt: string;
}

export interface Session {
  gymId: string;
  role: 'owner' | 'trainer';
  trainerId?: string;
}
