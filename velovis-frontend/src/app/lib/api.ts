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
// 1. İSTEK (REQUEST) YAKALAYICI (Burası zaten vardı)
// =================================================================
// İstek gönderilmeden ÖNCE çalışır
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
// 2. YANIT (RESPONSE) YAKALAYICI (YENİ EKLENEN KISIM)
// =================================================================
// Sunucudan yanıt geldikten SONRA çalışır
api.interceptors.response.use(
  // 2a. Başarılı yanıtlar (2xx) için:
  // Yanıtı olduğu gibi geri döndür
  (response) => {
    return response;
  },
  
  // 2b. Hatalı yanıtlar (4xx, 5xx) için:
  async (error) => {
    const originalRequest = error.config;
    
    // --- BU, BİZİM TOKEN YENİLEME MANTIĞIMIZ ---
    
    // Eğer 401 (Unauthorized) hatası aldıysak VE
    // bu istek ZATEN bir 'refresh' isteği DEĞİLSE
    // (sonsuz döngüyü engellemek için)
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      originalRequest._retry = true; // İsteği "denendi" olarak işaretle

      try {
        // Hafızadan 'refreshToken' ve 'setTokens' eylemini al
        const { tokens, setTokens } = useAuthStore.getState();
        const currentRefreshToken = tokens?.refreshToken;

        if (!currentRefreshToken) {
          // Hafızada 'refreshToken' yoksa, login'e yolla
          // (veya useAuthStore.getState().logout() yap)
          return Promise.reject(error);
        }

        // 1. YENİ TOKEN'LARI ALMAK İÇİN /auth/refresh ENDPOINT'İNİ ÇAĞIR
        // ÖNEMLİ: Yeni bir axios instance'ı KULLANMADAN,
        // temel 'axios' ile istek atıyoruz ki interceptor'a yakalanmasın.
        const { data: newTokens } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {
            refreshToken: currentRefreshToken,
          }
        );

        // 2. YENİ TOKEN'LARI GLOBAL HAFIZAYA (ZUSTAND) KAYDET
        setTokens(newTokens); // (Bu, localStorage'ı da günceller)

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