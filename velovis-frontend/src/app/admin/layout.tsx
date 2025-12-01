"use client"; // Bu koruma, tarayıcıda (client-side) çalışmak zorunda

import { useAuthStore } from "../lib/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// (Header'dakiyle aynı yetkiyi arıyoruz)
const REQUIRED_PERMISSION = 'roles:read'; 

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Giriş yapmış mı?
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    // 2. Gerekli yetkisi ('roles:read') var mı?
    const hasPermission = user?.permissions.includes(REQUIRED_PERMISSION);

    if (!hasPermission) {
      router.replace('/');
      return;
    }
    
    // 3. Tüm kontrollerden geçti, yetkisi var.
    setIsAuthorized(true);
    
  }, [isAuthenticated, user, router]);

  // Yetki kontrol edilirken "Yükleniyor..." göster (içeriğin sızmasını engeller)
  if (!isAuthorized) {
    return (
      <div className="container mx-auto p-4 text-center text-yellow-400">
        Yetki kontrol ediliyor...
      </div>
    );
  }

  // Yetkisi varsa, sayfayı (children) göster
  return (
    <>
      {children}
    </>
  );
}