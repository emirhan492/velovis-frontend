"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useCartStore } from 'src/app/lib/store/cart.store';

export default function CartPage() {
  const router = useRouter();
  
  const { items, removeItem, updateItemQuantity, fetchCart } = useCartStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart().finally(() => setLoading(false));
  }, [fetchCart]);

  // SADECE ÜRÜN TOPLAMI (Kargo Yok)
  const total = items.reduce((total, item) => {
    return total + Number(item.product.price) * item.quantity;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse tracking-widest text-xs uppercase">Sepet Yükleniyor...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-6">
        <h2 className="text-2xl font-light tracking-tight">SEPETİNİZ BOŞ</h2>
        <p className="text-zinc-500 text-sm">Henüz koleksiyonumuzdan bir parça eklemediniz.</p>
        <Link 
          href="/products" 
          className="bg-white text-black px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
        >
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-light mb-12 tracking-tighter uppercase">
            Sepetim ({items.length})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* SOL: Ürün Listesi */}
          <div className="lg:col-span-2 space-y-8">
            {items.map((item) => (
              <div key={item.id} className="flex gap-6 border-b border-zinc-900 pb-8 last:border-0">
                
                <Link href={`/products/${item.product.id}`} className="relative w-24 h-32 bg-zinc-900 shrink-0 cursor-pointer">
                  {item.product.primaryPhotoUrl && (
                    <Image
                      src={
                        item.product.primaryPhotoUrl.startsWith('http') || item.product.primaryPhotoUrl.startsWith('/')
                          ? item.product.primaryPhotoUrl 
                          : `/${item.product.primaryPhotoUrl}`
                      }
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <Link href={`/products/${item.product.id}`} className="text-lg font-light text-white hover:underline decoration-zinc-500 underline-offset-4">
                        {item.product.name}
                      </Link>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                    {item.size && <p className="text-xs text-zinc-500 mt-1 uppercase">Beden: {item.size}</p>}
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center border border-zinc-800">
                      <button 
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-zinc-900 transition-colors disabled:opacity-30"
                        disabled={item.quantity <= 1}
                      >
                        <MinusIcon className="w-3 h-3 text-zinc-400" />
                      </button>
                      <span className="w-8 text-center text-xs font-mono">{item.quantity}</span>
                      <button 
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-zinc-900 transition-colors"
                      >
                        <PlusIcon className="w-3 h-3 text-zinc-400" />
                      </button>
                    </div>
                    
                    <span className="font-mono text-lg">
                      ₺{(Number(item.product.price) * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SAĞ: ÖZET (KARGO KALDIRILDI) */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/30 border border-zinc-800 p-6 sticky top-32">
              <h2 className="text-lg font-light uppercase tracking-widest mb-6 border-b border-zinc-800 pb-4">
                Sipariş Özeti
              </h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Ara Toplam</span>
                  <span className="font-mono">₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                </div>
                {/* KARGO SATIRI SİLİNDİ */}
              </div>

              <div className="flex justify-between text-lg font-medium text-white border-t border-zinc-800 pt-4 mb-8">
                <span>Toplam</span>
                <span className="font-mono">₺{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </div>

              <button
                onClick={() => router.push('/checkout')} 
                className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
              >
                Siparişi Tamamla
              </button>
              

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
