"use client"; // Bu koruma, tarayıcıda (client-side) çalışmak zorunda

import { useAuthStore } from "../lib/store/auth.store"; // Göreceli yol
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  

  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Giriş yapmış mı?
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    
    // 2. Giriş yapmış, sayfayı görmeye yetkisi var.
    setIsAuthorized(true);
    
  }, [isAuthenticated, router]);

  // Yetki kontrol edilirken "Yükleniyor..." göster
  if (!isAuthorized) {
    return (
      <div className="container mx-auto p-4 text-center text-yellow-400">
        Yükleniyor...
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