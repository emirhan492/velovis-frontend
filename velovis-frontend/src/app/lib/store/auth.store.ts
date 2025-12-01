import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// =================================================================
// TİP TANIMLAMALARI
// =================================================================

type User = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: string[];
};

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthState = {
  user: User | null; 
  tokens: Tokens | null;
  isAuthenticated: boolean;
  login: (tokens: Tokens, user: User) => void; 
  logout: () => void;
  setTokens: (tokens: Tokens) => void;
};

// =================================================================
// ZUSTAND STORE TANIMLAMASI
// =================================================================
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      
      login: (tokens, user) => {
        set({
          tokens: tokens,
          user: user,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          tokens: null,
          user: null,
          isAuthenticated: false,
        });
      },

      setTokens: (tokens) => {
        set({
          tokens: tokens,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => localStorage),
    },
  ),
);