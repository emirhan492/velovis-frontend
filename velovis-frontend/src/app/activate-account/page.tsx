'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '../lib/api'; 
import Link from 'next/link';

// =================================================================
// İÇ BİLEŞEN: MANTIKSAL İŞLEMLER
// =================================================================
function ActivationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const activateAccount = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
          const response = await api.get(`/auth/activate?token=${token}`);

          setSuccess(
            response.data.message || 'Hesap başarıyla aktifleştirildi!',
          );
          setIsLoading(false);

          // 3 saniye sonra giriş sayfasına at
          setTimeout(() => {
            router.push('/login?activated=true');
          }, 3000);
        } catch (err: any) {
          console.error(err);
          if (err.response && err.response.data && err.response.data.message) {
            setError(err.response.data.message);
          } else {
            setError(
              'Aktivasyon sırasında bir hata oluştu veya link geçersiz.',
            );
          }
          setIsLoading(false);
        }
      };

      activateAccount();
    } else {
      setError("Aktivasyon anahtarı (token) bulunamadı.");
      setIsLoading(false);
    }
  }, [token, router]);

  // --- Arayüz (UI) ---

  // 1. DURUM: YÜKLENİYOR
  if (isLoading) {
    return (
      <div className="flex flex-col items-center space-y-4 py-12">
        <div className="w-16 h-16 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
        <p className="text-zinc-500 text-xs uppercase tracking-widest animate-pulse">
          Hesabınız doğrulanıyor...
        </p>
      </div>
    );
  }

  // 2. DURUM: HATA
  if (error) {
    return (
      <div className="space-y-8 text-center py-8">
        <div className="p-6 border border-red-900/50 bg-red-900/10 text-red-400">
          <p className="text-sm uppercase tracking-wide font-bold mb-2">Aktivasyon Başarısız</p>
          <p className="text-xs text-red-300/80">{error}</p>
        </div>
        
        <Link 
          href="/login" 
          className="inline-block border-b border-white pb-1 text-xs uppercase tracking-widest hover:text-zinc-400 transition-colors"
        >
          Giriş sayfasına dön
        </Link>
      </div>
    );
  }

  // 3. DURUM: BAŞARI
  if (success) {
    return (
      <div className="space-y-8 text-center py-8">
        <div className="p-6 border border-green-900/50 bg-green-900/10 text-green-400">
          <p className="text-sm uppercase tracking-wide font-bold mb-2">İşlem Başarılı</p>
          <p className="text-xs text-green-300/80">{success}</p>
        </div>
        
        <div className="text-zinc-500 text-[10px] uppercase tracking-widest animate-pulse">
          Giriş sayfasına yönlendiriliyorsunuz...
        </div>
      </div>
    );
  }

  return null;
}

// =================================================================
// ANA SAYFA BİLEŞENİ (WRAPPER)
// =================================================================
export default function ActivateAccountPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        
        {/* BAŞLIK */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-light tracking-tighter">
            VELOVIS
          </h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em]">
            Hesap Aktivasyonu
          </p>
        </div>

        {/* SUSPENSE & İÇERİK */}
        <div className="mt-12 border-t border-zinc-900 pt-8">
          <Suspense
            fallback={
              <div className="text-center text-zinc-500 text-xs uppercase tracking-widest">
                Yükleniyor...
              </div>
            }
          >
            <ActivationContent />
          </Suspense>
        </div>

      </div>
    </main>
  );
}