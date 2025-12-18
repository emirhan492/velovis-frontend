"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useCartStore } from 'src/app/lib/store/cart.store';
import { useAuthStore } from 'src/app/lib/store/auth.store'; 
import api from 'src/app/lib/api';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const user = useAuthStore((state) => state.user);

  // Adres State'i
  const [address, setAddress] = useState({
    contactName: user?.fullName || '',
    city: '',       
    district: '',   
    phone: '',      
    address: '',    
  });

  const [loading, setLoading] = useState(false);

  // Toplam Tutar (Sadece ürünlerin fiyatı)
  const totalPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Form Geçerlilik Kontrolü
  const isFormValid = 
    address.contactName?.trim().length > 0 &&
    address.city?.trim().length > 0 &&
    address.district?.trim().length > 0 &&
    address.phone?.trim().length > 9 && 
    address.address?.trim().length > 0;

  const handlePaymentStart = async () => {
    if (!isFormValid) {
        alert("Lütfen tüm adres bilgilerini eksiksiz doldurunuz.");
        return;
    }

    setLoading(true);

    try {
      console.log("Ödeme isteği gönderiliyor...", address);

      // Backend'e istek atılıyor
      const { data } = await api.post('/payment/initialize', {
        items: cartItems,
        address: address, 
        price: totalPrice
      });

      // Iyzico Formunu Çalıştır
      if (data.checkoutFormContent) {
         const formContainer = document.getElementById('iyzico-checkout-form');
         if (formContainer) {
            formContainer.innerHTML = data.checkoutFormContent;
            
            const scripts = formContainer.getElementsByTagName('script');
            Array.from(scripts).forEach((oldScript) => {
              const newScript = document.createElement('script');
              if (oldScript.textContent) newScript.textContent = oldScript.textContent;
              if (oldScript.hasAttribute('src')) newScript.src = oldScript.getAttribute('src') || '';
              oldScript.parentNode?.replaceChild(newScript, oldScript);
            });

            formContainer.scrollIntoView({ behavior: 'smooth' });
         }
      }

    } catch (error: any) {
      console.error("Ödeme hatası:", error);
      
      // HATA YÖNETİMİ
      if (error.response?.status === 404) {
         alert("HATA: Sunucuya ulaşılamadı (404). Lütfen Backend terminalini kapatıp 'npm run start:dev' ile yeniden başlatın.");
      } else {
         alert("Ödeme başlatılamadı: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return "/placeholder.jpg";
    if (url.startsWith('http') || url.startsWith('/')) return url;
    return `/${url}`;
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* SOL: ADRES FORMU */}
        <div>
          <h2 className="text-2xl font-light mb-8 uppercase tracking-widest">Teslimat Adresi</h2>
          <div className="space-y-4">
            
            {/* Ad Soyad */}
            <div>
              <label className="text-xs uppercase text-zinc-500">Ad Soyad *</label>
              <input 
                type="text" 
                value={address.contactName}
                onChange={(e) => setAddress({...address, contactName: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none placeholder-zinc-700" 
                placeholder="Emirhan Çelik"
              />
            </div>

            {/* İl ve İlçe */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs uppercase text-zinc-500">İl *</label>
                  <input 
                    type="text" 
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none placeholder-zinc-700" 
                    placeholder="İstanbul"
                  />
               </div>
               <div>
                  <label className="text-xs uppercase text-zinc-500">İlçe *</label>
                  <input 
                    type="text" 
                    value={address.district}
                    onChange={(e) => setAddress({...address, district: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none placeholder-zinc-700" 
                    placeholder="Kadıköy"
                  />
               </div>
            </div>

            {/* Telefon */}
            <div>
              <label className="text-xs uppercase text-zinc-500">Telefon Numarası *</label>
              <input 
                type="tel" 
                value={address.phone}
                onChange={(e) => setAddress({...address, phone: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none placeholder-zinc-700" 
                placeholder="05XX XXX XX XX"
              />
            </div>

            {/* Açık Adres */}
            <div>
              <label className="text-xs uppercase text-zinc-500">Açık Adres *</label>
              <textarea 
                rows={4}
                value={address.address}
                onChange={(e) => setAddress({...address, address: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none placeholder-zinc-700" 
                placeholder="Mahalle, Sokak, Kapı No, Daire No..."
              />
            </div>
            
            {!isFormValid && (
                <p className="text-xs text-red-500 mt-2">* Lütfen tüm alanları doldurunuz.</p>
            )}
          </div>
        </div>

        {/* SAĞ: SİPARİŞ ÖZETİ (KARGO KALDIRILDI) */}
        <div>
          <h2 className="text-2xl font-light mb-8 uppercase tracking-widest">Sipariş Özeti</h2>
          
          <div className="bg-zinc-900 p-6 border border-zinc-800 mb-6">
             {/* Ürün Listesi */}
             <div className="mb-4 space-y-4 border-b border-zinc-800 pb-4">
                {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm text-zinc-400">
                        <div className="flex items-center gap-3">
                           <div className="relative w-12 h-16 bg-zinc-800 shrink-0">
                              {item.product.primaryPhotoUrl && (
                                <Image 
                                  src={getImageUrl(item.product.primaryPhotoUrl)}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              )}
                           </div>
                           <div className="flex flex-col">
                              <span className="text-white font-medium">{item.product.name}</span>
                              <span className="text-xs text-zinc-500">Adet: {item.quantity}</span>
                           </div>
                        </div>

                        <span className="font-mono text-white">
                           ₺{(item.product.price * item.quantity).toLocaleString('tr-TR')}
                        </span>
                    </div>
                ))}
             </div>

             {/* KARGO SATIRI KALDIRILDI, SADECE TOPLAM KALDI */}
             <div className="flex justify-between text-lg font-mono mb-4 text-white">
                <span>Toplam Tutar</span>
                <span>₺{totalPrice.toLocaleString('tr-TR')}</span>
             </div>
             
             <button 
               onClick={handlePaymentStart}
               disabled={!isFormValid || loading || cartItems.length === 0}
               className={`w-full py-4 font-bold uppercase tracking-widest transition-colors
                 ${(!isFormValid || loading || cartItems.length === 0) 
                    ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed' 
                    : 'bg-white text-black hover:bg-zinc-200 cursor-pointer'
                 }
               `}
             >
               {loading ? 'Ödeme Başlatılıyor...' : 'Ödemeye Geç'}
             </button>
          </div>

          <div id="iyzico-checkout-form" className="responsive mt-8"></div>
        </div>

      </div>
    </div>
  );
}