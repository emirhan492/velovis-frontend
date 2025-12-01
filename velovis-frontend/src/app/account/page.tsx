"use client";

import { useAuthStore } from "../lib/store/auth.store";
import { useMutation } from "@tanstack/react-query";
import api from "../lib/api";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid';

// =================================================================
// ŞİFRE DEĞİŞTİRME FORMU
// =================================================================
function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => {
      return api.patch('/auth/change-password', {
        currentPassword,
        newPassword,
      });
    },
    onSuccess: (data) => {
      setSuccess((data.data as any).message || "Şifre başarıyla güncellendi.");
      setError(null);
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (err: any) => {
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
    mutation.mutate();
  };

  return (
    <div className="border border-zinc-800 p-8 bg-zinc-900/20">
      <h2 className="text-xl font-light uppercase tracking-widest mb-8 border-b border-zinc-800 pb-2">
        Güvenlik Ayarları
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mevcut Şifre */}
        <div>
          <label htmlFor="currentPassword" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Mevcut Şifre
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="block w-full bg-zinc-950 border border-zinc-800 p-4 text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-white transition-colors"
            >
              {showCurrent ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Yeni Şifre */}
        <div>
          <label htmlFor="newPassword" className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Yeni Şifre (Min. 8 Karakter)
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="block w-full bg-zinc-950 border border-zinc-800 p-4 text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-white transition-colors"
            >
              {showNew ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mesaj Alanları */}
        {success && (
          <div className="p-3 border border-green-900/50 bg-green-900/10 text-green-400 text-xs text-center uppercase tracking-wide">
            {success}
          </div>
        )}
        {error && (
          <div className="p-3 border border-red-900/50 bg-red-900/10 text-red-400 text-xs text-center uppercase tracking-wide">
            {error}
          </div>
        )}

        {/* Buton */}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'İşleniyor...' : 'Şifreyi Güncelle'}
        </button>
      </form>
    </div>
  );
}


// =================================================================
// ANA "Hesabım" SAYFASI
// =================================================================
export default function AccountPage() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center pt-24">
            <div className="animate-pulse tracking-widest text-sm uppercase">Hesap Bilgileri Yükleniyor...</div>
        </div>
    );
  }

  // Kullanıcının ADMIN olup olmadığını kontrol ediyoruz
  const isAdmin = user.roles && user.roles.includes('ADMIN');

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pt-24 pb-20">
      <div className="container mx-auto px-6">
        
        {/* BAŞLIK ALANI */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter mb-4">
            HESABIM
          </h1>
          <div className="h-px w-full bg-zinc-800"></div>
          <div className="flex justify-between items-center mt-4 text-sm text-zinc-500 uppercase tracking-widest">
            <span>Üyelik Detayları</span>
            <span>Aktif</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* SOL TARAF: PROFİL BİLGİLERİ */}
          <div>
            <div className="border border-zinc-800 p-8 bg-zinc-900/20 h-full">
              <h2 className="text-xl font-light uppercase tracking-widest mb-8 border-b border-zinc-800 pb-2">
                Kişisel Bilgiler
              </h2>
              
              <div className="space-y-8">
                {/* İsim */}
                <div className="group">
                  <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">
                    Ad Soyad
                  </span>
                  <span className="block text-2xl font-light text-white">
                    {user.fullName}
                  </span>
                </div>

                {/* Kullanıcı Adı */}
                <div className="group">
                   <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">
                    Kullanıcı Adı
                  </span>
                  <span className="block text-xl font-mono text-zinc-300">
                    @{user.username}
                  </span>
                </div>

                {/* E-posta */}
                <div className="group">
                   <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1 group-hover:text-white transition-colors">
                    E-Posta Adresi
                  </span>
                  <span className="block text-lg text-zinc-300">
                    {user.email}
                  </span>
                </div>

                {/* Roller - SADECE ADMIN GÖREBİLİR */}
                {isAdmin && (
                  <div className="pt-4 border-t border-zinc-800/50">
                     <span className="block text-xs font-bold text-red-500 uppercase tracking-widest mb-2">
                      Yetki Seviyesi (Admin Görünümü)
                    </span>
                    <div className="flex gap-2">
                      {user.roles.map((role) => (
                        <span key={role} className="border border-red-900/50 bg-red-900/10 text-red-400 px-3 py-1 text-xs uppercase tracking-widest">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SAĞ TARAF: ŞİFRE FORMU */}
          <div>
            <ChangePasswordForm />
          </div>

        </div>
      </div>
    </main>
  );
}