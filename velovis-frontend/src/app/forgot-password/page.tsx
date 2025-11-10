"use client"; // Bu, interaktif bir sayfadır.

import { useState } from "react";
import api from "../lib/api"; // Göreceli yolla API istemcimiz

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form gönderildiğinde çalışacak fonksiyon
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // 1. ADIM: Backend'e e-postayı yolla
      const { data } = await api.post('/auth/forgot-password', { email });

      // 2. ADIM: Başarılı olduysa...
      // (Backend, e-posta olmasa bile güvenlik için hep bu mesajı döner)
      setSuccess(data.message || "Eğer bu e-posta adresi kayıtlıysa, bir sıfırlama linki gönderildi.");
      setEmail(""); // Formu temizle

    } catch (err: any) {
      // Bir hata oluşursa
      console.error(err);
      setError("Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto max-w-sm p-4">
      <h1 className="text-3xl font-bold text-center text-blue-400">Şifremi Unuttum</h1>
      <p className="mt-2 text-center text-gray-400">
        Hesabınıza kayıtlı e-posta adresini girin, size bir sıfırlama linki gönderelim.
      </p>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium text-gray-300"
          >
            E-posta Adresi
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 p-2 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
          </button>
        </div>
      </form>
    </main>
  );
}