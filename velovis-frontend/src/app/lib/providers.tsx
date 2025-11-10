"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react"; // useEffect ve useState eklendi

// Bu fonksiyon, 'localStorage' senkronizasyon sorununu çözer.
function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // useEffect, bu kodun SADECE tarayıcıda (client-side)
    // çalışmasını garanti eder.
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

// Query Client'ı fonksiyonun dışına taşıdık (best practice)
const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  // Hydration kontrolünü ekledik
  const isHydrated = useHydration();

  // Eğer sayfa henüz "hydrate" olmadıysa (yani sunucu render'ıysa
  // veya tarayıcı daha 'useEffect'i çalıştırmadıysa),
  // hiçbir şey gösterme (veya bir 'loading' ekranı göster).
  // Bu, o 'false' vs 'true' çakışmasını engeller.
  if (!isHydrated) {
    return null; // Veya <LoadingSpinner />
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}