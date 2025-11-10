import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../app/lib/providers"; // Göreceli yola devam edelim
import Header from "@/components/Header"; // 1. Header'ı import et (@/components... çalışmalı)

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Velovis E-Ticaret",
  description: "NestJS ve Next.js ile geliştirilen e-ticaret projesi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Providers>
          {/* 2. Header'ı buraya, children'ın üstüne ekle */}
          <Header/>
          
          {/* Sayfa içeriği (örn: HomePage) burada render edilecek */}
          {children}

          {/* (İleride buraya bir Footer da ekleyebiliriz) */}
        </Providers>
      </body>
    </html>
  );
}