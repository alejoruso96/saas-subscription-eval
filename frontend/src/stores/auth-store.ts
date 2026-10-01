import type { SessionUser } from '@/types/domain';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthState = {
  token: string | null;
  user: SessionUser | null;
  setSession: (token: string, user: SessionUser) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      clear: () => set({ token: null, user: null }),
    }),
    {
      name: 'meridiano-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
