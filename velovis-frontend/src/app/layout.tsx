import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../app/lib/providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Velovis Wear",
  description: "NestJS ve Next.js ile geliştirilen e-ticaret projesi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      {/* Body'e genel siyah tema ve fontu ekledik */}
      <body className={`${inter.className} bg-black text-white antialiased`}>
        <Providers>
          
          {/* Tüm sayfayı kapsayan kutu */}
          <div className="flex flex-col min-h-screen">
            
            {/* Header En Üstte */}
            <Header />
            
            {/* Main: İçeriğin olduğu kısım. 'flex-1' ile boşluğu doldurur */}
            <main className="flex-1">
              {children}
            </main>

            {/* Footer En Altta */}
            <Footer />
            
          </div>

        </Providers>
      </body>
    </html>
  );
}