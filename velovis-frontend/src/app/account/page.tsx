"use client"; // Hook'ları (useState, useMutation) kullanmak için

import { useAuthStore } from "../lib/store/auth.store"; // Göreceli yolla Global Hafızamız
import { useMutation } from "@tanstack/react-query"; // 1. useMutation'ı import et
import api from "../lib/api"; // 2. API istemcimizi import et
import { useState } from "react"; // 3. useState'i import et
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid'; // 4. Göz ikonlarını import et

// =================================================================
// ŞİFRE DEĞİŞTİRME FORMU ALT COMPONENT'İ
// =================================================================
function ChangePasswordForm() {
  // Form state'leri
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  // Başarı/Hata state'leri
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // API İsteği (Mutation)
  const mutation = useMutation({
    mutationFn: () => {
      // Backend'de oluşturduğumuz yeni endpoint'i çağır
      return api.patch('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    },
    onSuccess: (data) => {
      // Başarılı olursa
      setSuccess((data.data as any).message || "Şifre başarıyla güncellendi.");
      setError(null);
      setCurrentPassword("");
      setNewPassword("");
      // (Backend tüm oturumları kapattığı için kullanıcıyı logout'a zorlayabiliriz,
      // ama şimdilik sadece mesaj gösterelim)
    },
    onError: (err: any) => {
      // Hata olursa (örn: 403 Mevcut şifre yanlış)
      const message = err.response?.data?.message || "Bir hata oluştu.";
      setError(message);
      setSuccess(null);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Yeni parola en az 8 karakter olmalıdır.");
      return;
    }
    setError(null);
    setSuccess(null);
    mutation.mutate(); // API isteğini tetikle
  };

  return (
    <div className="mt-8 max-w-lg rounded-lg bg-gray-800 p-6 shadow">
      <h2 className="text-2xl font-semibold">Şifre Değiştir</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Mevcut Şifre */}
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-300"
          >
            Mevcut Şifre
          </label>
          <div className="relative mt-1">
            <input
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="block w-full rounded-md border-gray-700 bg-gray-900 p-2 pr-10 text-white"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showCurrent ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
        </div>

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
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="block w-full rounded-md border-gray-700 bg-gray-900 p-2 pr-10 text-white"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showNew ? <EyeSlashIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
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

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
        </button>
      </form>
    </div>
  );
}


// =================================================================
// ANA "Hesabım" SAYFASI COMPONENT'İ
// =================================================================
export default function AccountPage() {
  
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
        <main className="container mx-auto p-4">
            <h1 className="text-3xl font-bold text-blue-400">Hesabım</h1>
            <p className="mt-4 text-yellow-400">Kullanıcı bilgileri yükleniyor...</p>
        </main>
    );
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-400">Hesabım</h1>
      <p className="mt-2 text-lg text-gray-400">
        Hoş geldin, {user.fullName}. Buradan hesap bilgilerini yönetebilirsin.
      </p>

      {/* Grid yapısı ekleyelim (yan yana dursunlar) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Sol Taraf: Profil Bilgileri */}
        <div className="rounded-lg bg-gray-800 p-6 shadow">
          <h2 className="text-2xl font-semibold">Profil Bilgileri</h2>
          <div className="mt-4 space-y-3">
            <div>
              <span className="block text-sm font-medium text-gray-400">Tam Ad</span>
              <span className="block text-lg text-white">{user.fullName}</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-400">Kullanıcı Adı</span>
              <span className="block text-lg text-white">{user.username}</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-400">E-posta</span>
              <span className="block text-lg text-white">{user.email}</span>
            </div>
            {user.roles && user.roles.length > 0 && (
              <div>
                <span className="block text-sm font-medium text-gray-400">Roller</span>
                <span className="block text-lg text-white">
                  {user.roles.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Sağ Taraf: Şifre Değiştirme Formu */}
        <ChangePasswordForm />

      </div>
    </main>
  );
}