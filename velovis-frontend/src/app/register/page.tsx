"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../lib/api";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/20/solid';

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
  
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await api.post('auth/register', formData);

      setSuccess("Kayıt başarılı. Lütfen e-postanızı kontrol edin.");
      setFormData(initialFormState);

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

  // Ortak Input Stili
  const inputClassName = "block w-full bg-zinc-950 border border-zinc-800 p-4 text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition-colors";
  const labelClassName = "block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2";

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-20">
      
      <div className="w-full max-w-md space-y-8">
        
        {/* BAŞLIK */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-light tracking-tighter">
            VELOVIS
          </h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em]">
            Yeni Üyelik
          </p>
        </div>
      
        <form onSubmit={handleSubmit} className="mt-12 space-y-6">
          
          {/* İsim & Soyisim */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="firstName" className={labelClassName}>İsim</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={inputClassName}
                placeholder="Adınız"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="lastName" className={labelClassName}>Soyisim</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={inputClassName}
                placeholder="Soyadınız"
              />
            </div>
          </div>
          
          {/* Kullanıcı Adı */}
          <div>
            <label htmlFor="username" className={labelClassName}>Kullanıcı Adı</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              className={inputClassName}
              placeholder="kullaniciadi"
            />
          </div>
          
          {/* E-posta */}
          <div>
            <label htmlFor="email" className={labelClassName}>E-posta</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputClassName}
              placeholder="ornek@email.com"
            />
          </div>

          {/* Parola */}
          <div>
            <label htmlFor="password" className={labelClassName}>Parola</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className={`${inputClassName} pr-12`}
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
            <p className="mt-2 text-[10px] text-zinc-600 uppercase tracking-wider">
              En az 8 karakter uzunluğunda olmalıdır.
            </p>
          </div>

          {/* Mesajlar */}
          {success && (
            <div className="p-4 border border-green-900/50 bg-green-900/10 text-green-400 text-xs text-center uppercase tracking-wide">
              {success}
            </div>
          )}
          {error && (
            <div className="p-4 border border-red-900/50 bg-red-900/10 text-red-400 text-xs text-center uppercase tracking-wide">
              {error}
            </div>
          )}

          {/* Buton */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </button>
          </div>

          {/* Alt Link */}
          <div className="text-center pt-6 border-t border-zinc-900">
            <p className="text-zinc-600 text-xs">
              Zaten hesabın var mı?
              <Link href="/login" className="text-white hover:underline underline-offset-4 ml-2 uppercase tracking-widest text-[10px]">
                Giriş Yap
              </Link>
            </p>
          </div>

        </form>
      </div>
    </main>
  );
}