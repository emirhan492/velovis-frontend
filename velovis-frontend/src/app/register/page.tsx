"use client"; // Bu, tarayıcıda çalışan, interaktif bir sayfadır.

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../lib/api"; // Göreceli yolla API istemcimiz
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid'; // İkonları import et

// Formdaki tüm alanlar için bir state objesi
const initialFormState = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
};

export default function RegisterPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Şifre görünürlüğü için state
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  // Formdaki herhangi bir alanı güncellemek için
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form gönderildiğinde çalışacak fonksiyon
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Backend'e kayıt isteği at
      await api.post('/auth/register', formData);

      // Başarılı olduysa...
      setSuccess("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
      setFormData(initialFormState); // Formu temizle

      // 2 saniye bekle ve kullanıcıyı giriş sayfasına yönlendir
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto max-w-sm p-4">
      <h1 className="text-3xl font-bold text-center text-blue-400">Kayıt Ol</h1>
      
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        
        {/* --- EKSİK OLAN KISIMLAR BURADA --- */}
        {/* İsim */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">İsim</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 p-2 text-white"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">Soyisim</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 p-2 text-white"
            />
          </div>
        </div>
        
        {/* Kullanıcı Adı */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300">Kullanıcı Adı</label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 p-2 text-white"
          />
        </div>
        
        {/* E-posta */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">E-posta</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 p-2 text-white"
          />
        </div>
        {/* --- EKSİK KISIMLAR BİTTİ --- */}


        {/* Parola (Göz ikonuyla birlikte) */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">Parola</label>
          <div className="relative mt-1">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="block w-full rounded-md border-gray-700 bg-gray-800 p-2 pr-10 text-white"
            />
            <button
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Başarı ve Hata Mesajları */}
        {success && (
          <div className="rounded-md bg-green-800 p-3 text-center text-green-100">
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-800 p-3 text-center text-red-100">
            {error}
          </div>
        )}

        {/* Kayıt Ol Butonu */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
          </button>
        </div>
      </form>
    </main>
  );
}