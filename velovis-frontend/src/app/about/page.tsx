import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      
     

      {/* 2. MANİFESTO */}
      <section className="py-24 md:py-32 container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* Sol: Görsel */}
          <div className="relative h-[600px] w-full overflow-hidden grayscale hover:grayscale-0 duration-500 ">
            <Image
              src="/pics/25642805-3c7d-46a2-ac8c-b5907bcfbfee (1).jpeg" 
              alt="Ceket Detayı"
              fill
              className="object-cover hover:scale-105 transition-transform duration-1000 ease-out"
            />
          </div>

          {/* Sağ: Metin */}
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-light leading-none">
              Emirhan Usta
              <span className="block mt-2 text-sm md:text-base uppercase tracking-widest border-b border-white pb-1 ml-1 w-fit">Founder</span>
            </h2>
            <p className="text-zinc-400 leading-relaxed text-lg">
              Velovis Wear olarak yolculuğumuza 2021 yılında, sıradanlığa meydan okuyan tasarımlar üretme tutkusuyla başladık. Amerikan Kolej Montlarının zamansız ruhunu, modern çizgiler ve özel konseptlerle yeniden yorumluyoruz. Kısa sürede kazandığımız ilginiz, bize doğru yolda olduğumuzu gösteriyor. Ancak bu daha başlangıç; kuralları yeniden yazacak tasarımlarla tarzınıza eşlik etmeye devam edeceğiz.
            </p>
            
            
            <div className="pt-4 grid grid-cols-2 gap-8 border-t border-zinc-900 mt-8">
             
             <div className="pt-6">
  <a
    href="https://www.instagram.com/e_ustax"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-3 text-white hover:text-zinc-500 transition-colors duration-300 group"
  >
    {/* Instagram SVG İkonu */}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="group-hover:scale-110 transition-transform duration-300"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>

    {/* Yazı */}
    <span className="text-sm uppercase tracking-widest font-medium">
      Instagram
    </span>
  </a>
</div>
             
            </div>
          </div>
        </div>
      </section>

      {/* 3. ESTETİK VİTRİN */}
      <section className="w-full h-[500px] relative grayscale">
        <Image
          src="/pics/IMG_9801-scaled.jpeg"
          alt="Velovis Atölye"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <p className="text-2xl md:text-4xl font-serif italic text-white/90">
            "Moda geçer, stil kalır."
          </p>
        </div>
      </section>
      {/* İLETİŞİM BÖLÜMÜ */}
      <section className="py-24 border-b border-zinc-900">
        <div className="container mx-auto px-6 text-center">
          
          {/* Başlık */}
          <h2 className="text-2xl md:text-3xl font-light uppercase tracking-[0.3em] mb-16 text-white">
            İletişim
          </h2>

          {/* Linkler */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-32">
            
            {/* 1. Instagram */}
            <a 
              href="https://www.instagram.com/velovis.wear" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-6"
            >
              {/* İkon Kutusu */}
              <div className="w-16 h-16 flex items-center justify-center border border-zinc-800 rounded-full group-hover:border-white group-hover:scale-110 transition-all duration-500">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" // İnce çizgi
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="text-zinc-400 group-hover:text-white transition-colors"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              {/* Yazı */}
              <div className="space-y-1">
                <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">
                  Instagram
                </span>
                <span className="block text-lg font-light text-zinc-300">
                  @velovis.wear
                </span>
              </div>
            </a>

            {/* 2. E-Posta */}
            <a 
              href="" 
              className="group flex flex-col items-center gap-6"
            >
              {/* İkon Kutusu */}
              <div className="w-16 h-16 flex items-center justify-center border border-zinc-800 rounded-full group-hover:border-white group-hover:scale-110 transition-all duration-500">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="text-zinc-400 group-hover:text-white transition-colors"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              {/* Yazı */}
              <div className="space-y-1">
                <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">
                  E-Posta
                </span>
                <span className="block text-lg font-light text-zinc-300">
                  veloviswear1@gmail.com
                </span>
              </div>
            </a>

          </div>
        </div>
      </section>
      

      {/* 5. FOOTER CTA */}
      <section className="py-24 border-t border-zinc-900 flex flex-col items-center text-center px-4">
        <h2 className="text-4xl md:text-6xl font-light mb-8 tracking-tight">
          Tarzını Tamamla.
        </h2>
        <Link 
          href="/products" 
          className="group relative inline-flex items-center justify-center px-8 py-4 text-sm uppercase tracking-widest transition-all duration-300 ease-out border border-white hover:bg-white hover:text-black"
        >
          Koleksiyonu İncele
          <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </section>
    </div>
  );
}