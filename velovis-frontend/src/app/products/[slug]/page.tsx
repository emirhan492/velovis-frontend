"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import api from 'src/app/lib/api';
import { useAuthStore } from 'src/app/lib/store/auth.store';
import { useCartStore } from 'src/app/lib/store/cart.store';
// 👇 İKONLARI EKLİYORUZ
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  stockQuantity: number;
  primaryPhotoUrl: string | null;
  category?: { name: string };
  photos: { id: string; url: string; isPrimary: boolean }[];
}

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ProductDetailPage() {
  const params = useParams();
  const productId = (params.id || params.slug) as string; 
  
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // --- YENİ RESİM VE ANİMASYON STATE'LERİ ---
  const [allPhotos, setAllPhotos] = useState<string[]>([]); // Tüm resimlerin listesi
  const [currentIndex, setCurrentIndex] = useState(0); // Şu an kaçıncı resimdeyiz
  const [isAnimating, setIsAnimating] = useState(false); // Animasyon durumu

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const isCartLoading = useCartStore((state) => state.isLoading);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${productId}`);
        const data = response.data;
        setProduct(data);
        
        // 1. Tüm fotoğrafları tek bir listede birleştiriyoruz
        let photos: string[] = [];
        
        // Ana fotoğrafı en başa koy
        if (data.primaryPhotoUrl) {
          photos.push(data.primaryPhotoUrl);
        }
        
        // Diğer fotoğrafları ekle (Ana fotoğraf tekrar eklenmesin diye filtreleyebiliriz ama 
        // şimdilik basitçe photos array'ini ekliyoruz)
        if (data.photos && data.photos.length > 0) {
           const galleryUrls = data.photos.map((p: any) => p.url);
           // Set kullanarak duplicate (tekrar eden) resimleri temizleyelim
           photos = Array.from(new Set([...photos, ...galleryUrls]));
        }

        // Eğer hiç resim yoksa placeholder koy
        if (photos.length === 0) {
            photos.push("https://picsum.photos/800/1000?grayscale");
        }

        setAllPhotos(photos);

      } catch (err) {
        console.error("Ürün bulunamadı:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // --- ANİMASYONLU RESİM DEĞİŞTİRME FONKSİYONU ---
  const changeImage = (newIndex: number) => {
    if (newIndex === currentIndex) return;

    // 1. Resmi söndür (Fade Out)
    setIsAnimating(true);

    // 2. 300ms sonra resmi değiştir ve tekrar yak (Fade In)
    // Bu süre CSS'deki duration-300 ile aynı olmalı
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsAnimating(false);
    }, 200);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % allPhotos.length; // Sona geldiyse başa dön
    changeImage(nextIndex);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + allPhotos.length) % allPhotos.length; // Başa geldiyse sona dön
    changeImage(prevIndex);
  };

  const handleThumbnailClick = (index: number) => {
    changeImage(index);
  };

  const handleAddToCart = async () => {
    setError(null);
    setSuccess(null);

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!product) return;
    if (!selectedSize) {
      setError("Lütfen bir beden seçiniz.");
      return;
    }

    const itemInCart = cartItems.find((item) => item.product.id === product.id);
    const quantityInCart = itemInCart ? itemInCart.quantity : 0;
    const totalRequestedQuantity = quantityInCart + quantity;

    if (totalRequestedQuantity > product.stockQuantity) {
      setError(`Stok yetersiz.`);
      return;
    }

    try {
      await addItem(product.id, quantity, selectedSize);
      setSuccess(`${product.name} (${selectedSize}) sepete eklendi.`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse tracking-widest text-sm uppercase">Yükleniyor...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-light">Ürün Bulunamadı</h2>
        <a href="/products" className="border-b border-white pb-1 text-sm uppercase tracking-widest">Koleksiyona Dön</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pt-32 pb-20">
      <div className="container mx-auto px-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          
          {/* ================= SOL: GALERİ ALANI ================= */}
          <div className="flex flex-col gap-6">
            
            {/* 1. BÜYÜK ANA RESİM (SLIDER) */}
            <div className="relative w-full aspect-[3/4] bg-zinc-900 overflow-hidden group border border-zinc-800">
              
              <Image
                src={allPhotos[currentIndex]}
                alt={product.name}
                fill
                className={`object-cover transition-all duration-500 ease-out
      ${isAnimating 
        ? 'opacity-80 scale-95 blur-[2px]'  // Değişirken: Hafif flu, %95 küçülmüş
        : 'opacity-100 scale-100 blur-0'    // Normal: Net, tam boyut
      } 
    `}
                // isAnimating true ise opacity düşer (söner), false ise 100 olur (yanar)
                priority
              />

              {/* İLERİ / GERİ OKLARI (Sadece 1'den fazla resim varsa göster) */}
              {allPhotos.length > 1 && (
                <>
                  {/* SOL OK */}
                  <button 
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-white hover:text-black text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>

                  {/* SAĞ OK */}
                  <button 
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-white hover:text-black text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* 2. KÜÇÜK RESİMLER (THUMBNAILS) */}
            {allPhotos.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {allPhotos.map((photoUrl, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`relative w-20 h-24 flex-shrink-0 overflow-hidden border transition-all duration-300
                      ${currentIndex === index 
                        ? 'border-white opacity-100 scale-105' 
                        : 'border-zinc-800 opacity-50 hover:opacity-100 hover:border-zinc-600'}
                    `}
                  >
                    <Image
                      src={photoUrl}
                      alt={`Detay ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ================= SAĞ: BİLGİ ALANI (AYNI KALDI) ================= */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4 border-b border-zinc-800 pb-8">
              {product.category && (
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  {product.category.name}
                </span>
              )}
              <h1 className="text-4xl md:text-6xl font-light tracking-tighter leading-none">
                {product.name}
              </h1>
              <p className="text-2xl md:text-3xl font-mono text-zinc-300">
                ₺{Number(product.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-zinc-400 leading-relaxed font-light text-lg">
                {product.longDescription || product.shortDescription}
              </p>
            </div>

            {/* Beden Seçimi */}
            <div className="space-y-4 pt-4">
               <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Beden Seçin</span>
                  <button className="text-xs underline text-zinc-400 hover:text-white">Beden Tablosu</button>
               </div>
               <div className="flex gap-4">
                  {AVAILABLE_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 flex items-center justify-center border text-sm font-medium transition-all duration-300
                        ${selectedSize === size 
                          ? 'bg-white text-black border-white' 
                          : 'bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-500 hover:text-white'}
                      `}
                    >
                      {size}
                    </button>
                  ))}
               </div>
               {!selectedSize && error === "Lütfen bir beden seçiniz." && (
                 <p className="text-red-500 text-xs mt-2 animate-pulse">Lütfen sepete eklemeden önce beden seçiniz.</p>
               )}
            </div>

            {/* Miktar */}
            <div className="flex items-center justify-between border border-zinc-800 p-4 mt-4">
               <span className="text-zinc-500 uppercase tracking-widest text-xs">Adet</span>
               <div className="flex items-center space-x-6">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-xl px-2 hover:text-zinc-300 transition-colors"
                  >-</button>
                  <span className="text-lg font-mono w-4 text-center">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="text-xl px-2 hover:text-zinc-300 transition-colors"
                  >+</button>
               </div>
            </div>

            {/* Butonlar */}
            <div className="pt-6 space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity <= 0 || isCartLoading}
                className={`w-full py-5 text-sm font-bold uppercase tracking-[0.2em] transition-all duration-300 border border-white
                  ${product.stockQuantity > 0 
                    ? 'hover:bg-white hover:text-black text-white' 
                    : 'opacity-50 cursor-not-allowed text-zinc-500 border-zinc-800'}
                `}
              >
                {isCartLoading ? 'Ekleniyor...' : (product.stockQuantity > 0 ? 'Sepete Ekle' : 'Tükendi')}
              </button>

              {error && error !== "Lütfen bir beden seçiniz." && (
                <div className="p-3 border border-red-900/50 bg-red-900/10 text-red-400 text-xs text-center uppercase tracking-wide">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 border border-green-900/50 bg-green-900/10 text-green-400 text-xs text-center uppercase tracking-wide">
                  {success}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-zinc-800 text-center text-[10px] uppercase tracking-widest text-zinc-500">
               <div>🚚 Ücretsiz Kargo</div>
               <div>↩️ 14 Gün İade</div>
               <div>🔒 Güvenli Ödeme</div>
            </div>
            

          </div>
        </div>
      </div>
    </div>
    
  );
}