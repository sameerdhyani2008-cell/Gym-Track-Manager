import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Gym, Member, Trainer, Plan, RevenueEntry, Session } from '@/types';

const GYMS_KEY = 'gym_app_gyms_v1';
const SESSION_KEY = 'gym_app_session_v1';

export async function getGyms(): Promise<Gym[]> {
  const raw = await AsyncStorage.getItem(GYMS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Gym[];
  } catch {
    return [];
  }
}

export async function saveGyms(gyms: Gym[]): Promise<void> {
  await AsyncStorage.setItem(GYMS_KEY, JSON.stringify(gyms));
}

export async function getSession(): Promise<Session | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export async function saveSession(session: Session): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function generateGymId(ownerName: string, phone: string, city: string): string {
  const parts = ownerName.trim().split(/\s+/);
  const first = parts[0]?.[0]?.toUpperCase() ?? 'X';
  const last = parts[parts.length - 1]?.[0]?.toUpperCase() ?? 'X';
  const digits = phone.replace(/\D/g, '').slice(-4);
  const cityChar = city.trim().slice(-1).toUpperCase();
  return `${first}${last}${digits}${cityChar}`;
}

export function generateTrainerId(name: string, gymId: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0]?.toUpperCase() ?? 'X';
  const last = parts[parts.length - 1]?.[0]?.toUpperCase() ?? 'X';
  const gymPrefix = gymId.slice(0, 4);
  const rand = Math.floor(10 + Math.random() * 90);
  return `TR${first}${last}${gymPrefix}${rand}`;
}

export async function createGym(data: {
  name: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPhone: string;
  city: string;
  state: string;
  password: string;
  plan: 'free' | 'pro';
  plans: Plan[];
}): Promise<Gym> {
  const gyms = await getGyms();
  const id = generateGymId(data.ownerName, data.ownerPhone, data.city);
  const gym: Gym = {
    id,
    name: data.name,
    ownerName: data.ownerName,
    ownerEmail: data.ownerEmail,
    ownerPhone: data.ownerPhone,
    city: data.city,
    state: data.state,
    password: data.password,
    plan: data.plan,
    plans: data.plans,
    members: [],
    trainers: [],
    revenues: [],
    createdAt: new Date().toISOString(),
  };
  gyms.push(gym);
  await saveGyms(gyms);
  return gym;
}

export async function loginOwner(gymId: string, password: string): Promise<Gym | null> {
  const gyms = await getGyms();
  const gym = gyms.find(g => g.id === gymId && g.password === password);
  if (!gym) return null;
  await saveSession({ gymId: gym.id, role: 'owner' });
  return gym;
}

export async function loginTrainer(trainerId: string, password: string): Promise<{ gym: Gym; trainer: Trainer } | null> {
  const gyms = await getGyms();
  for (const gym of gyms) {
    const trainer = gym.trainers.find(t => t.id === trainerId && t.password === password);
    if (trainer) {
      await saveSession({ gymId: gym.id, role: 'trainer', trainerId: trainer.id });
      return { gym, trainer };
    }
  }
  return null;
}

export async function getGymById(gymId: string): Promise<Gym | null> {
  const gyms = await getGyms();
  return gyms.find(g => g.id === gymId) ?? null;
}

export async function addMember(gymId: string, data: Omit<Member, 'id' | 'attendanceDates'>): Promise<Member> {
  const gyms = await getGyms();
  const gym = gyms.find(g => g.id === gymId);
  if (!gym) throw new Error('Gym not found');
  const member: Member = { ...data, id: generateId(), attendanceDates: [] };
  gym.members.push(member);

  // Auto-add income entry
  const plan = gym.plans.find(p => p.id === data.planId);
  const revenue: RevenueEntry = {
    id: generateId(),
    type: 'income',
    description: `Membership - ${data.name} (${plan?.name ?? 'Plan'})`,
    amount: data.amountPaid,
    date: data.startDate,
    paymentMethod: data.paymentMethod,
    memberId: member.id,
  };
  gym.revenues.push(revenue);

  await saveGyms(gyms);
  return member;
}

export async function updateMember(gymId: string, memberId: string, updates: Partial<Member>): Promise<void> {
  const gyms = await getGyms();
  const gym = gyms.find(g => g.id === gymId);
  if (!gym) return;
  const idx = gym.members.findIndex(m => m.id === memberId);
  if (idx < 0) return;
  gym.members[idx] = { ...gym.members[idx], ...updates };
  await saveGyms(gyms);
}

export async function toggleAttendance(gymId: string, memberId: string, dateStr: string): Promise<void> {
  const gyms = await getGyms();
  const gym = gyms.find(g => g.id === gymId);
  if (!gym) return;
  const member = gym.members.find(m => m.id === memberId);
  if (!member) return;
  const idx = member.attendanceDates.indexOf(dateStr);
  if (idx >= 0) {
    member.attendanceDates.splice(idx, 1);
  } else {
    member.attendanceDates.push(dateStr);
  }
  await saveGyms(gyms);
}

export async function addRevenue(gymId: string, entry: Omit<RevenueEntry, 'id'>): Promise<void> {
  const gyms = await getGyms();
  const gym = gyms.find(g => g.id === gymId);
  if (!gym) return;
  gym.revenues.push({ ...entry, id: generateId() });
  await saveGyms(gyms);
}

export async function addTrainer(gymId: string, data: Omit<Trainer, 'id' | 'gymId'>): Promise<Trainer> {
  const gyms = await getGyms();
  const gym = gyms.find(g => g.id === gymId);
  if (!gym) throw new Error('Gym not found');
  const id = generateTrainerId(data.name, gymId);
  const trainer: Trainer = { ...data, id, gymId };
  gym.trainers.push(trainer);
  await saveGyms(gyms);
  return trainer;
}

export async function removeTrainer(gymId: string, trainerId: string): Promise<void> {
  const gyms = await getGyms();
  const gym = gyms.find(g => g.id === gymId);
  if (!gym) return;
  gym.trainers = gym.trainers.filter(t => t.id !== trainerId);
  await saveGyms(gyms);
}

export async function addPlan(gymId: string, data: Omit<Plan, 'id'>): Promise<Plan> {
  const gyms = await getGyms();
  const gym = gyms.find(g => g.id === gymId);
  if (!gym) throw new Error('Gym not found');
  const plan: Plan = { ...data, id: generateId() };
  gym.plans.push(plan);
  await saveGyms(gyms);
  return plan;
}

export async function removePlan(gymId: string, planId: string): Promise<void> {
  const gyms = await getGyms();
  const gym = gyms.find(g => g.id === gymId);
  if (!gym) return;
  gym.plans = gym.plans.filter(p => p.id !== planId);
  await saveGyms(gyms);
}

export async function updateGymSettings(gymId: string, updates: Partial<Pick<Gym, 'name' | 'ownerName' | 'ownerEmail' | 'ownerPhone' | 'city' | 'state' | 'password'>>): Promise<void> {
  const gyms = await getGyms();
  const gym = gyms.find(g => g.id === gymId);
  if (!gym) return;
  Object.assign(gym, updates);
  await saveGyms(gyms);
}

export function getTodayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getFootfall(gym: Gym): { date: string; count: number }[] {
  const days: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = gym.members.filter(m => m.attendanceDates.includes(dateStr)).length;
    days.push({ date: dateStr, count });
  }
  return days;
}

export function getMonthRevenue(gym: Gym): number {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return gym.revenues
    .filter(r => r.type === 'income' && r.date.startsWith(month))
    .reduce((sum, r) => sum + r.amount, 0);
}

export function getExpiringMembers(gym: Gym, days = 7): Member[] {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);
  return gym.members.filter(m => {
    if (m.status !== 'active') return false;
    const end = new Date(m.endDate);
    return end >= now && end <= future;
  });
}
