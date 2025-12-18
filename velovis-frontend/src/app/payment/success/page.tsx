

import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
      
      {/* Merkez Kutu */}
      <div className="border border-zinc-800 bg-zinc-950 p-12 max-w-md w-full text-center">
        
        {/* Başarı İkonu (Minimal) */}
        <div className="w-24 h-24 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
          <svg
            className="w-10 h-10 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="square"
              strokeLinejoin="miter"
              strokeWidth="1.5"  
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        
        <h1 className="text-3xl font-light uppercase tracking-widest mb-4">
          Sipariş Onaylandı
        </h1>
        
        <div className="h-px w-16 bg-green-500 mx-auto mb-6"></div>

        <p className="text-zinc-400 mb-12 text-sm font-light leading-relaxed">
          Ödemeniz başarıyla alındı.
        </p>

        <div className="space-y-4">
          <Link 
            href="/orders" 
            className="block w-full py-4 border border-white text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300"
          >
            Siparişi Görüntüle
          </Link>

          <Link 
            href="/" 
            className="block w-full py-4 text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] hover:text-white transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>

      </div>
    </div>
  );
}
