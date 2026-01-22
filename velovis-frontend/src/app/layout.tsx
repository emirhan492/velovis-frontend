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
    default: "Velovis Wear",
    template: "%s | Velovis Wear",
  },
  description: "Custom design, unique and premium clothes.",

  openGraph: {
    title: 'Velovis Wear',
    description: 'Custom design, unique and premium clothes.',
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
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        
        {/* 2. META PIXEL KODU */}
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
        
        {/* 3. NOSCRIPT KODU */}
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