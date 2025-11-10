"use client"; 

import { useCartStore } from "../lib/store/cart.store"; 
import Image from "next/image";
import Link from "next/link";
import api from "../lib/api"; 
import { useRouter } from "next/navigation"; 
import { useState, useEffect } from "react"; // 1. useEffect'i import et

export default function CartPage() {
  const {
    items,
    isLoading,
    error,
    removeItem,
    updateItemQuantity,
    fetchCart, // Fonksiyonu hafızadan alıyoruz
  } = useCartStore();

  const router = useRouter();
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // =================================================================
  // --- HATA ÇÖZÜMÜ BURADA ---
  // 2. Sayfa yüklendiğinde (component mount olduğunda) 
  //    fetchCart fonksiyonunu BİR KEZ çalıştır.
  useEffect(() => {
    fetchCart();
  }, [fetchCart]); // fetchCart değişirse (ki değişmez) tekrar çalıştır
  // =================================================================

  // Sepet toplam fiyatını hesapla
  const totalPrice = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Sipariş Verme Fonksiyonu
  const handleCheckout = async () => {
    setOrderError(null);
    setIsPlacingOrder(true);
    try {
      const { data: order } = await api.post('/orders');
      await fetchCart(); 
      alert(`Siparişiniz başarıyla oluşturuldu! Sipariş ID: ${order.id}`);
      router.push('/'); 
    } catch (err: any) {
      console.error("Sipariş verilirken hata:", err);
      const message = err.response?.data?.message || "Sipariş verilemedi.";
      setOrderError(message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // =================================================================
  // ARAYÜZ (UI) KISMI
  // =================================================================
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-400">Sepetim</h1>

      {/* DURUM 1: YÜKLENİYOR */}
      {/* fetchCart çalıştığı için bu 'isLoading' durumu artık 'true' olacak */}
      {isLoading && <p className="mt-8 text-yellow-400">Sepet yükleniyor...</p>}

      {/* DURUM 2: HATA (Senin gördüğün hataydı, artık görünmemeli) */}
      {error && <p className="mt-8 text-red-500">Hata: {error}</p>}

      {/* DURUM 3: SEPET BOŞ (Yükleme bittikten sonra) */}
      {!isLoading && !error && items.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-xl text-gray-400">Sepetiniz boş.</p>
          <Link href="/" className="mt-4 inline-block text-blue-500 hover:underline">
            Alışverişe Başla
          </Link>
        </div>
      )}

      {/* DURUM 4: SEPET DOLU (Artık burası görünecek) */}
      {!isLoading && items.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Sol Taraf: Ürün Listesi (Senin istediğin sayaçlar burada) */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between rounded-lg bg-gray-800 p-4 shadow"
              >
                {/* Ürün Bilgisi */}
                <div className="flex items-center space-x-4">
                  <Image
                    src={item.product.primaryPhotoUrl || 'https://via.placeholder.com/80'}
                    alt={item.product.name}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{item.product.name}</h3>
                    <p className="text-gray-400">{item.product.price} TL</p>
                  </div>
                </div>

                {/* Kontroller (Adet Sayacı ve Sil Butonu) */}
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={item.quantity}
                    min={1}
                    max={item.product.stockQuantity} // Stoktan fazla seçtirme
                    onChange={(e) => 
                      updateItemQuantity(item.id, Number(e.target.value))
                    }
                    className="w-20 rounded-md border-gray-700 bg-gray-700 p-2 text-white"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sağ Taraf: Sipariş Özeti (Toplam Fiyat burada) */}
          <div className="md:col-span-1">
            <div className="rounded-lg bg-gray-800 p-6 shadow">
              <h2 className="text-2xl font-semibold">Sipariş Özeti</h2>
              <div className="mt-6 flex justify-between border-t border-gray-700 pt-4">
                <span className="text-lg font-medium">Toplam</span>
                <span className="text-xl font-bold text-green-500">
                  {totalPrice.toFixed(2)} TL
                </span>
              </div>
              
              {/* Sipariş Ver Butonu */}
              <button
                onClick={handleCheckout}
                disabled={isPlacingOrder || items.length === 0}
                className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 text-lg font-bold text-white shadow-lg transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isPlacingOrder ? 'Sipariş Veriliyor...' : 'Sipariş Ver'}
              </button>
              
              {orderError && (
                 <div className="mt-4 rounded-md bg-red-800 p-3 text-center text-red-100">
                   {orderError}
                 </div>
              )}
            </div>
          </div>

        </div>
      )}
    </main>
  );
}