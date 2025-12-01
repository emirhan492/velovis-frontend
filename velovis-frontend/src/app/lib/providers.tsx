"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";


function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {

    setIsHydrated(true);
  }, []);

  return isHydrated;
}

// Query Client'ı fonksiyonun dışına taşıdık (best practice)
const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {

  const isHydrated = useHydration();

  if (!isHydrated) {
    return null; 
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}