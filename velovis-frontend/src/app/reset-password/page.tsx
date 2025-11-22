"use client"; // Bu, interaktif bir sayfadır (hook'lar kullanır)

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // 1. URL'den token'ı okumak için
import api from "../lib/api"; // Göreceli yolla API istemcimiz
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid'; // Göz ikonları

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // URL ?token=... kısmını okumak için

  // Form state'leri
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Durum state'leri
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. ADIM: Sayfa yüklendiğinde URL'den token'ı oku
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      // Token yoksa, bu sayfada işi yok, ana sayfaya yolla
      setError("Geçersiz sıfırlama linki. Lütfen tekrar deneyin.");
      setTimeout(() => router.push('/forgot-password'), 2000);
    }
  }, [searchParams, router]);

  // 2. ADIM: Form gönderildiğinde
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Parola kontrolleri
    if (newPassword.length < 8) {
      setError("Yeni parola en az 8 karakter olmalıdır.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Parolalar eşleşmiyor. Lütfen kontrol edin.");
      return;
    }
    if (!token) {
      setError("Geçersiz token. Lütfen işlemi baştan başlatın.");
      return;
    }

    setIsLoading(true);

    try {
      // 3. ADIM: Backend'e isteği yolla
      const { data } = await api.post('/auth/reset-password', {
        token: token,
        newPassword: newPassword,
      });

      // 4. ADIM: Başarılı olduysa
      setSuccess(data.message || "Şifreniz başarıyla sıfırlandı! Giriş sayfasına yönlendiriliyorsunuz...");
      
      // 2 saniye bekle ve kullanıcıyı giriş sayfasına yönlendir
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      // 5. ADIM: Hata oluşursa (örn: 403 Token geçersiz/süresi dolmuş)
      console.error(err);
      const message = err.response?.data?.message || "Bir hata oluştu.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Eğer token URL'de yoksa veya yükleniyorsa, formu gösterme
  if (!token && !error) {
    return (
      <main className="container mx-auto max-w-sm p-4 text-center">
        <p className="text-yellow-400">Sıfırlama linki doğrulanıyor...</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto max-w-sm p-4">
      <h1 className="text-3xl font-bold text-center text-blue-400">Yeni Şifre Belirle</h1>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {/* Yeni Şifre */}
        <div>
          <label 
            htmlFor="newPassword" 
            className="block text-sm font-medium text-gray-300"
          >
            Yeni Şifre (En az 8 karakter)
          </label>
          <div className="relative mt-1">
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="block w-full rounded-md border-gray-700 bg-gray-800 p-2 pr-10 text-white"
            />
            <button
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Yeni Şifre (Tekrar) */}
        <div>
          <label 
            htmlFor="confirmPassword" 
            className="block text-sm font-medium text-gray-300"
          >
            Yeni Şifre (Tekrar)
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 p-2 text-white"
          />
        </div>

        {/* Başarı mesajı alanı */}
        {success && (
          <div className="rounded-md bg-green-800 p-3 text-center text-green-100">
            {success}
          </div>
        )}

        {/* Hata mesajı alanı */}
        {error && (
          <div className="rounded-md bg-red-800 p-3 text-center text-red-100">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading || !!success} // Başarılıysa butonu kilitle
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </div>
      </form>
    </main>
  );
}