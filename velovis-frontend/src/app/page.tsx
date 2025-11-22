import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      
      {/* 1. HERO SECTION (Tam Ekran) */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        {/* Arkaplan Resmi */}
        <div className="absolute inset-0 z-0 opacity-40 grayscale">
          <Image
            src="/pics/velovis_hero.jpeg" // Ceket/Model görseli
            alt="Velovis Hero"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-0"></div>

        {/* İçerik */}
        <div className="relative z-10 text-center space-y-8 px-4">
          
          <h1 className="text-6xl md:text-9xl font-light tracking-tighter leading-none">
            VELOVİS<br />WEAR
          </h1>
          <div className="pt-8">
            <Link 
              href="/products" 
              className="inline-block border border-white px-12 py-4 text-sm uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300"
            >
              Koleksiyonu Keşfet
            </Link>
          </div>
        </div>
      </section>

      {/* 2. ÖNE ÇIKAN KATEGORİLER */}
     

      {/* 3. MARQUEE (Kayan Yazı Efekti) */}
      <div className="py-12 border-b border-zinc-900 overflow-hidden bg-zinc-950">
        <div className="whitespace-nowrap animate-marquee text-zinc-800 text-8xl font-black uppercase opacity-50 select-none">
          velovis &bull; wear &bull; velovis &bull; wear &bull; Velovis &bull; wear &bull; velovis &bull; wear &bull; velovis &bull;
        </div>
      </div>

      

      

    </div>
  );
}