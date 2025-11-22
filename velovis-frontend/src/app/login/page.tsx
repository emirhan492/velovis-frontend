// Dosya: src/app/login/page.tsx

"use client";

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '../lib/api';
import { useAuthStore } from '../lib/store/auth.store';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid';

// =================================================================
// === SUSPENSE WRAPPER (Loading durumunu yönetir) ===
// =================================================================
export default function LoginPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-zinc-500 text-xs uppercase tracking-widest">Yükleniyor...</div>
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}

// =================================================================
// === ANA LOGIN COMPONENT ===
// =================================================================
function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState<string | null>(null);

  const { login } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Aktivasyon linkinden gelindiyse mesaj göster
  useEffect(() => {
    const activated = searchParams.get('activated');
    const errorParam = searchParams.get('error');

    if (activated === 'true') {
      setActivationSuccess('Hesabınız başarıyla aktifleştirildi. Şimdi giriş yapabilirsiniz.');
      router.replace('/login', { scroll: false });
    } else if (errorParam === 'activation_failed') {
      setError('Hesap aktivasyonu başarısız oldu. Link geçersiz veya süresi dolmuş olabilir.');
      router.replace('/login', { scroll: false });
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (activationSuccess) setActivationSuccess(null);

    try {
      const { data: tokens } = await api.post('/auth/login', {
        username,
        password,
      });
      
      const { data: user } = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      
      login(tokens, user);
      router.push('/');
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || "Kullanıcı adı veya parola hatalı.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-20">
      
      {/* Form Kutusu */}
      <div className="w-full max-w-md space-y-8">
        
        {/* Başlık */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-light tracking-tighter">
            VELOVIS
          </h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em]">
            Giriş Yap
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-12">
          
          {/* Aktivasyon Başarı Mesajı */}
          {activationSuccess && (
            <div className="p-4 border border-green-900/50 bg-green-900/10 text-green-400 text-xs text-center uppercase tracking-wide">
              {activationSuccess}
            </div>
          )}

          {/* Hata Mesajı */}
          {error && (
            <div className="p-4 border border-red-900/50 bg-red-900/10 text-red-400 text-xs text-center uppercase tracking-wide">
              {error}
            </div>
          )}

          {/* Kullanıcı Adı */}
          <div className="space-y-2">
            <label 
              htmlFor="username" 
              className="block text-xs font-bold text-zinc-500 uppercase tracking-widest"
            >
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="block w-full bg-zinc-950 border border-zinc-800 p-4 text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="Kullanıcı adınız"
            />
          </div>
          
          {/* Parola */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="password" 
                className="block text-xs font-bold text-zinc-500 uppercase tracking-widest"
              >
                Parola
              </label>
            </div>
            
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full bg-zinc-950 border border-zinc-800 p-4 text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Buton */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>

          {/* Linkler (Şifremi Unuttum & Kayıt Ol) */}
          <div className="flex flex-col items-center space-y-4 mt-8 pt-8 border-t border-zinc-900">
            <Link 
              href="/forgot-password" 
              className="text-xs text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
            >
              Şifremi unuttum
            </Link>
            
            <div className="text-zinc-600 text-xs">
              Hesabın yok mu?{' '}
              <Link href="/register" className="text-white hover:underline underline-offset-4 ml-1">
                Kayıt Ol
              </Link>
            </div>
          </div>

        </form>
      </div>
    </main>
  );
}