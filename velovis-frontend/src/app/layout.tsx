import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "../app/lib/providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

// --- METADATA AYARLARI ---
export const metadata: Metadata = {
  metadataBase: new URL('https://www.veloviswear.com'), 

  title: {
    default: "Velovis Wear | Custom design,unique and premium clothes.",
    template: "%s | Velovis Wear",
  },
  description: "Velovis Wear ile tarzını yansıt. Özel tasarım, yüksek kaliteli streetwear giyim ve ceket koleksiyonlarını keşfet.",
  
  keywords: ["streetwear", "giyim", "özel tasarım", "velovis", "moda", "premium giyim"],

  openGraph: {
    title: 'Velovis Wear',
    description: 'Özel tasarım, yüksek kaliteli streetwear giyim koleksiyonları.',
    url: 'https://www.veloviswear.com',
    siteName: 'Velovis Wear',
    locale: 'tr_TR',
    type: 'website',
  },
  
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
  

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Velovis Wear',
    url: 'https://www.veloviswear.com',
    logo: 'https://www.veloviswear.com/pics/header_logo.png',
    description: 'Velovis Wear, özel tasarım ve premium kalitede ürünler sunan bir giyim markasıdır.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'veloviswear1@gmail.com' 
    },
    sameAs: [
      'https://www.instagram.com/velovis.wear' 
    ]
  }

  return (
    <html lang="tr">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* 3. META PIXEL */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '744934802004617');
              fbq('track', 'PageView');
            `,
          }}
        />
        
        {/* NOSCRIPT */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=744934802004617&ev=PageView&noscript=1"
            alt="facebook pixel"
          />
        </noscript>

        <Providers>
          
          {/* Tüm sayfayı kapsayan kutu */}
          <div className="flex flex-col min-h-screen">
            
            {/* Header En Üstte */}
            <Header />
            
            {/* Main: İçeriğin olduğu kısım */}
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