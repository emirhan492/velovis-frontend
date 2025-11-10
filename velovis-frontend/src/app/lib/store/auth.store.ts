import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// =================================================================
// TİP TANIMLAMALARI (Düzeltildi)
// =================================================================

// Hem API'dan gelen, hem de saklanan tip artık AYNI: string[]
type User = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
  permissions: string[]; // <-- 'Set' değil, 'string[]' (Array)
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
      
      // --- HATA ÇÖZÜMÜ BURADA ---
      // Artık 'Set'e dönüştürme YOK.
      // API'dan 'User' (içinde 'string[]' var) alıyoruz,
      // ve onu olduğu gibi 'set' ediyoruz.
      login: (tokens, user) => {
        set({
          tokens: tokens,
          user: user, // Veriyi 'Set'e dönüştürmeden, olduğu gibi (Array olarak) kaydet
          isAuthenticated: true,
        });
      },
      // --- ÇÖZÜM BİTTİ ---

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