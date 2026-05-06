import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearSession, getGymById, getSession } from '@/store';
import type { Gym, Session, Trainer } from '@/types';

interface AuthContextType {
  session: Session | null;
  gym: Gym | null;
  trainer: Trainer | null;
  loading: boolean;
  setAuth: (session: Session, gym: Gym, trainer?: Trainer) => void;
  refreshGym: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  gym: null,
  trainer: null,
  loading: true,
  setAuth: () => {},
  refreshGym: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const saved = await getSession();
      if (saved) {
        const g = await getGymById(saved.gymId);
        if (g) {
          setGym(g);
          setSession(saved);
          if (saved.trainerId) {
            const t = g.trainers.find(tr => tr.id === saved.trainerId);
            if (t) setTrainer(t);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function setAuth(s: Session, g: Gym, t?: Trainer) {
    setSession(s);
    setGym(g);
    setTrainer(t ?? null);
  }

  async function refreshGym() {
    if (!session) return;
    const g = await getGymById(session.gymId);
    if (g) setGym(g);
  }

  async function logout() {
    await clearSession();
    setSession(null);
    setGym(null);
    setTrainer(null);
  }

  return (
    <AuthContext.Provider value={{ session, gym, trainer, loading, setAuth, refreshGym, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
