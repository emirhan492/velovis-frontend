"use client";

import { useCartStore } from "../lib/store/cart.store";
import Image from "next/image";
import Link from "next/link";
import api from "../lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CartPage() {
  const {
    items,
    isLoading,
    error,
    removeItem,
    updateItemQuantity,
    fetchCart,
  } = useCartStore();

  const router = useRouter();
  
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  
  // Iyzico'dan gelen formu tutacak state
  const [checkoutFormContent, setCheckoutFormContent] = useState<string | null>(null);

  // 1. Sayfa yüklendiğinde sepeti çek
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Backend'den HTML geldiğinde içindeki <script> kodunu bulup çalıştırır.
  useEffect(() => {
    if (checkoutFormContent) {
      const scriptContent = checkoutFormContent.match(
        /<script type="text\/javascript">([\s\S]*?)<\/script>/
      )?.[1];

      if (scriptContent) {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.innerHTML = scriptContent;
        document.body.appendChild(script);

        return () => {
          document.body.removeChild(script);
        };
      }
    }
  }, [checkoutFormContent]);

  // Sepet toplam fiyatı
  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Ödeme Başlatma Fonksiyonu
  const handlePayment = async () => {
    setPaymentError(null);
    setIsPaymentLoading(true);
    try {
      const response = await api.post('/payment/start');

      if (response.data && response.data.checkoutFormContent) {
        setCheckoutFormContent(response.data.checkoutFormContent);
      } else {
        setPaymentError('Ödeme formu oluşturulamadı.');
      }
    } catch (err: any) {
      console.error("Ödeme başlatılırken hata:", err);
      const message = err.response?.data?.message || "Ödeme sistemi başlatılamadı.";
      setPaymentError(message);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // =================================================================
  // ARAYÜZ (UI) KISMI
  // =================================================================
  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pt-24 pb-20">
      <div className="container mx-auto px-6">
        
        {/* BAŞLIK ALANI */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter mb-4">
            SEPETİM
          </h1>
          <div className="h-px w-full bg-zinc-800"></div>
          <div className="flex justify-between items-center mt-4 text-sm text-zinc-500 uppercase tracking-widest">
            
            <span>{items.length} Parça</span>
          </div>
        </div>

        {/* DURUM 1: YÜKLENİYOR */}
        {isLoading && (
          <div className="py-20 text-center animate-pulse text-sm uppercase tracking-widest text-zinc-400">
            Sepet Bilgileri Alınıyor...
          </div>
        )}

        {/* DURUM 2: API HATASI */}
        {error && (
          <div className="py-10 text-center text-red-500 border border-red-900/30 bg-red-900/10 p-4">
            Hata: {error}
          </div>
        )}

        {/* DURUM 3: SEPET BOŞ */}
        {!isLoading && !error && items.length === 0 && (
          <div className="py-20 text-center space-y-6">
            <p className="text-xl font-light text-zinc-400">Sepetinizde henüz ürün bulunmuyor.</p>
            <Link 
              href="/products" 
              className="inline-block border-b border-white pb-1 text-sm uppercase tracking-widest hover:text-zinc-400 transition-colors"
            >
              Koleksiyona Göz At →
            </Link>
          </div>
        )}

        {/* DURUM 4: SEPET DOLU */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* SOL: Ürün Listesi */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* EĞER FORM GELDİYSE FORMU GÖSTER */}
              {checkoutFormContent ? (
                 <div className="bg-white text-black p-4 rounded-sm">
                    <div id="iyzipay-checkout-form" className="responsive"></div>
                 </div>
              ) : (
                // FORM YOKSA ÜRÜNLERİ GÖSTER
                <div className="space-y-6">
                   {items.map((item) => (
                     <div key={item.id} className="flex gap-6 border-b border-zinc-900 pb-6 last:border-0">
                        {/* Ürün Resmi */}
                        <Link href={`/products/${item.product.id}`} className="relative w-24 h-32 bg-zinc-900 flex-shrink-0 overflow-hidden cursor-pointer group">
                           <Image
                             src={item.product.primaryPhotoUrl || 'https://picsum.photos/200/300?grayscale'}
                             alt={item.product.name}
                             fill
                             className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                           />
                        </Link>

                        {/* Ürün Bilgisi & Kontroller */}
                        <div className="flex-1 flex flex-col justify-between py-1">
                           <div className="flex justify-between items-start">
                              <div>
                                <Link href={`/products/${item.product.id}`} className="text-lg font-light hover:underline decoration-zinc-600 underline-offset-4 block">
                                  {item.product.name}
                                </Link>
                                {/* BEDEN BİLGİSİ BURADA GÖSTERİLİYOR */}
                                {item.size && (
                                  <span className="text-xs text-zinc-500 uppercase tracking-widest mt-2 block">
                                    Beden: <span className="text-white font-bold ml-1">{item.size}</span>
                                  </span>
                                )}
                              </div>
                              <p className="font-mono text-zinc-400">
                                ₺{Number(item.product.price).toLocaleString('tr-TR')}
                              </p>
                           </div>

                           <div className="flex justify-between items-end">
                              {/* Miktar Güncelleme */}
                              <div className="flex items-center space-x-4 border border-zinc-800 px-3 py-1">
                                 <span className="text-xs text-zinc-500 uppercase tracking-widest mr-2">Adet</span>
                                 <input
                                    type="number"
                                    value={item.quantity}
                                    min={1}
                                    max={item.product.stockQuantity}
                                    onChange={(e) => updateItemQuantity(item.id, Number(e.target.value))}
                                    className="w-10 bg-transparent text-center text-sm focus:outline-none appearance-none font-mono text-white"
                                 />
                              </div>

                              {/* Sil Butonu */}
                              <button
                                 onClick={() => removeItem(item.id)}
                                 className="text-xs text-zinc-500 uppercase tracking-widest hover:text-red-500 transition-colors border-b border-transparent hover:border-red-500 pb-0.5"
                              >
                                 Sepetten Çıkar
                              </button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              )}
            </div>

            {/* SAĞ: Sipariş Özeti */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 border border-zinc-800 p-8 bg-zinc-950/50">
                <h2 className="text-xl font-light mb-6 tracking-wide">SİPARİŞ ÖZETİ</h2>
                
                <div className="space-y-4 text-sm text-zinc-400 border-b border-zinc-800 pb-6 mb-6">
                  <div className="flex justify-between">
                    <span>Ara Toplam</span>
                    <span>₺{totalPrice.toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kargo</span>
                    <span className="text-white">Ücretsiz</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-base text-white uppercase tracking-widest">Toplam</span>
                  <span className="text-2xl font-mono text-white">
                    ₺{totalPrice.toLocaleString('tr-TR')}
                  </span>
                </div>

                {/* Ödeme Butonu */}
                {!checkoutFormContent && (
                  <button
                    onClick={handlePayment}
                    disabled={isPaymentLoading || items.length === 0}
                    className="w-full py-4 bg-white text-black font-bold uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPaymentLoading ? 'Yükleniyor...' : 'Ödemeye Geç'}
                  </button>
                )}

                {/* Hata Mesajları */}
                {paymentError && (
                  <div className="mt-4 p-3 border border-red-900/50 bg-red-900/10 text-red-400 text-xs text-center">
                    {paymentError}
                  </div>
                )}

                {/* Bilgi Mesajı */}
                {checkoutFormContent && (
                  <div className="mt-4 text-xs text-zinc-500 text-center uppercase tracking-wide">
                    Ödeme formu sol tarafta açıldı.<br/>Lütfen bilgilerinizi giriniz.
                  </div>
                )}

                {/* Güvenlik Rozetleri */}
                <div className="mt-8 flex justify-center gap-4 opacity-30 grayscale">
                   <div className="text-[10px] text-center w-full">🔒 Güvenli Ödeme Altyapısı</div>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}