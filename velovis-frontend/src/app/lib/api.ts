import axios from 'axios';
import { useAuthStore } from './store/auth.store'; // Auth Hafızamızı import et

console.log("YÜKLENEN API URL:", process.env.NEXT_PUBLIC_API_URL);

const API_BASE_URL = 'http://localhost:3000/api';

 const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =================================================================
// 1. İSTEK (REQUEST) YAKALAYICI
// =================================================================
api.interceptors.request.use(
  (config) => {
    const { tokens } = useAuthStore.getState();
    if (tokens) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// =================================================================
// 2. YANIT (RESPONSE) YAKALAYICI 
// =================================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },
  

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      originalRequest._retry = true;
      try {
        const { tokens, setTokens } = useAuthStore.getState();
        const currentRefreshToken = tokens?.refreshToken;

        if (!currentRefreshToken) {

          return Promise.reject(error);
        }

        const { data: newTokens } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {
            refreshToken: currentRefreshToken,
          }
        );

        // 2. YENİ TOKEN'LARI GLOBAL HAFIZAYA (ZUSTAND) KAYDET
        setTokens(newTokens);

        // 3. BAŞARISIZ OLAN ESKİ İSTEĞİ (originalRequest) YENİ TOKEN İLE GÜNCELLE
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

        // 4. BAŞARISIZ OLAN İSTEĞİ YENİDEN DENE
        return api(originalRequest);
        
      } catch (refreshError) {
        // 'refreshToken' da geçersizse (örn: 7 günü dolmuşsa)
        // Kullanıcının tüm bilgilerini temizle ve login'e at
        const { logout } = useAuthStore.getState();
        logout();
        window.location.href = '/login'; // Zorla login'e yönlendir
        return Promise.reject(refreshError);
      }
    }
    
    // 401 dışındaki diğer tüm hataları (403, 404, 500) olduğu gibi geri döndür
    return Promise.reject(error);
  }
);

 export default api;