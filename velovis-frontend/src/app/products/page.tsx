"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from 'src/app/lib/api';

interface Product {
  id: string;
  name: string;
  price: number;
  primaryPhotoUrl: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (error) {
        console.error("Ürünler yüklenirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 👇 YARDIMCI FONKSİYON: URL DÜZELTİCİ
  const getValidImageUrl = (url: string | null) => {
    if (!url) return "https://picsum.photos/800/1000?grayscale"; // Resim yoksa
    if (url.startsWith("http")) return url; // Dış linkse (Unsplash vb.) dokunma
    if (url.startsWith("/")) return url; // Zaten başında / varsa dokunma
    return `/${url}`; // Başında / yoksa ekle (Hata buradaydı!)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse tracking-widest uppercase text-sm">Koleksiyon Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pt-24">
      
      {/* Başlık */}
      <div className="container mx-auto px-6 mb-16">
        <h1 className="text-4xl md:text-6xl font-light tracking-tighter mb-4">
          KOLEKSİYON
        </h1>
        <div className="h-px w-full bg-zinc-800"></div>
        <div className="flex justify-between items-center mt-4 text-sm text-zinc-500 uppercase tracking-widest">
          <span>Sonbahar / Kış 2025</span>
          <span>{products.length} Ürün</span>
        </div>
      </div>

      {/* Ürün Izgarası */}
      <div className="container mx-auto px-6 pb-24">
        {products.length === 0 ? (
          <div className="text-zinc-500 text-center py-20">Henüz ürün bulunmuyor.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {products.map((product) => (
              <Link href={`/products/${product.id}`} key={product.id} className="group cursor-pointer block">
                
                {/* Resim Alanı */}
                <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900 mb-6">
                  <Image
                    // 👇 BURADA DÜZELTME FONKSİYONUNU KULLANDIK
                    src={getValidImageUrl(product.primaryPhotoUrl)}
                    alt={product.name}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                  />
                  
                  <div className="absolute bottom-0 left-0 w-full bg-white text-black py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-medium uppercase text-xs tracking-widest">
                    İncele
                  </div>
                </div>

                {/* Ürün Bilgisi */}
                <div className="space-y-1">
                  <h3 className="text-lg font-light text-zinc-100 group-hover:underline underline-offset-4 decoration-zinc-500 truncate">
                    {product.name}
                  </h3>
                  <p className="text-zinc-500 font-mono text-sm">
                    ₺{Number(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}