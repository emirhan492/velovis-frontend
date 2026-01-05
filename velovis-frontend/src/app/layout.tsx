import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../app/lib/providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

// --- METADATA AYARLARI ---
export const metadata: Metadata = {
  // Google ve Sosyal medya botları ana domaini buradan öğrenir.
  metadataBase: new URL('https://www.veloviswear.com'), 

  title: {
    default: "Velovis Wear",
    template: "%s | Velovis Wear", // Alt sayfalarda örn: "Deri Ceket | Velovis Wear" yazar
  },
  description: "Custom design, unique and premium clothes.",

  // 2. Sosyal Medya Paylaşımları İçin (WhatsApp, Twitter, LinkedIn vb.)
  openGraph: {
    title: 'Velovis Wear',
    description: 'Custom design, unique and premium clothes.',
    url: 'https://www.veloviswear.com',
    siteName: 'Velovis Wear',
    locale: 'tr_TR',
    type: 'website',
  },
  
  // 3. Robotlar (Google Botları) için izinler
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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