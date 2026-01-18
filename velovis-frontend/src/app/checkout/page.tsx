"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCartStore } from 'src/app/lib/store/cart.store';
import { useAuthStore } from 'src/app/lib/store/auth.store'; 
import api from 'src/app/lib/api';
import { useRouter } from 'next/navigation';
import { ShieldCheckIcon } from '@heroicons/react/24/solid'; 

export default function CheckoutPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);
  const user = useAuthStore((state) => state.user);

  // Adres State'i
  const [address, setAddress] = useState({
    contactName: '',
    email: '',
    city: '',       
    district: '',   
    phone: '',      
    address: '',    
  });

  // Kullanıcı bilgileri otomatik doldurma
  useEffect(() => {
    if (user) {
      setAddress((prev) => ({
        ...prev,
        contactName: user.fullName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const [loading, setLoading] = useState(false);

  // Toplam Tutar
  const totalPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  // Form Geçerlilik Kontrolü
  const isFormValid = 
    address.contactName?.trim().length > 0 &&
    address.email?.trim().length > 0 && 
    address.city?.trim().length > 0 &&
    address.district?.trim().length > 0 &&
    address.phone?.trim().length > 9 && 
    address.address?.trim().length > 0;

  const handlePaymentStart = async () => {
    if (!isFormValid) {
        alert("Lütfen tüm zorunlu alanları doldurunuz.");
        return;
    }

    setLoading(true);

    try {
      console.log("Ödeme isteği gönderiliyor...", address);

      // --- VERİ PAKETLEME ---
      const payload = {
        items: cartItems,
        price: totalPrice,
        address: address, 

        // --- MİSAFİR VERİLERİ ---
        ...(!user && {
            guestName: address.contactName,
            guestEmail: address.email,
            guestPhone: address.phone,
            guestAddress: `${address.address} ${address.district}/${address.city}`
        })
      };

      const { data } = await api.post('/payment/initialize', payload);

      // Iyzico Form
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
      
      if (error.response?.status === 404) {
         alert("HATA: Sunucuya ulaşılamadı. Lütfen Backend'in çalıştığından emin olun.");
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

  // --- BOŞ SEPET KORUMASI ---
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center space-y-6 px-4 text-center">
        <h1 className="text-3xl font-light tracking-tighter uppercase">Sepetiniz Boş</h1>
        <p className="text-zinc-500">Ödeme sayfasına gitmek için sepetinize ürün eklemelisiniz.</p>
        <button 
          onClick={() => router.push('/')}
          className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
        >
          Alışverişe Dön
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* SOL: ADRES FORMU */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-light uppercase tracking-widest">Teslimat & İletişim</h2>
            {!user && (
                <span className="text-xs font-bold text-zinc-500 bg-zinc-900 px-2 py-1 rounded">MİSAFİR ALIŞVERİŞİ</span>
            )}
          </div>
          
          <div className="space-y-4">
            
            {/* Ad Soyad */}
            <div>
              <label className="text-xs uppercase text-zinc-500">Ad Soyad *</label>
              <input 
                type="text" 
                value={address.contactName}
                onChange={(e) => setAddress({...address, contactName: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none placeholder-zinc-700 transition-colors" 
                placeholder="Adınız ve Soyadınız"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs uppercase text-zinc-500">E-Posta Adresi * <span className="text-[10px] lowercase text-zinc-600">(Sipariş detayı gönderilecek)</span></label>
              <input 
                type="email" 
                value={address.email}
                onChange={(e) => setAddress({...address, email: e.target.value})}
                disabled={!!user} 
                className={`w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none placeholder-zinc-700 transition-colors ${user ? 'text-zinc-500 cursor-not-allowed' : ''}`}
                placeholder="ornek@email.com"
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
                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none placeholder-zinc-700 transition-colors" 
                    placeholder="İstanbul"
                  />
               </div>
               <div>
                  <label className="text-xs uppercase text-zinc-500">İlçe *</label>
                  <input 
                    type="text" 
                    value={address.district}
                    onChange={(e) => setAddress({...address, district: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none placeholder-zinc-700 transition-colors" 
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
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none placeholder-zinc-700 transition-colors" 
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
                className="w-full bg-zinc-900 border border-zinc-800 p-3 text-white focus:border-white outline-none placeholder-zinc-700 transition-colors" 
                placeholder="Mahalle, Sokak, Kapı No, Daire No..."
              />
            </div>
            
            {!isFormValid && (
                <p className="text-xs text-red-500 mt-2">* Lütfen tüm alanları doldurunuz.</p>
            )}
          </div>
        </div>

        {/* SAĞ: SİPARİŞ ÖZETİ */}
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
                              
                              {/* BEDEN BİLGİSİ */}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-zinc-500">Adet: {item.quantity}</span>
                                {item.size && (
                                    <>
                                        <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                                        <span className="text-xs text-zinc-300">Beden: {item.size}</span>
                                    </>
                                )}
                              </div>
                           </div>
                        </div>

                        <span className="font-mono text-white">
                            ₺{(item.product.price * item.quantity).toLocaleString('tr-TR')}
                        </span>
                    </div>
                ))}
             </div>

             <div className="flex justify-between text-lg font-mono mb-4 text-white">
                <span>Toplam Tutar</span>
                <span>₺{totalPrice.toLocaleString('tr-TR')}</span>
             </div>
             
             {/* ÖDEME BUTONU */}
             <button 
               onClick={handlePaymentStart}
               disabled={!isFormValid || loading || cartItems.length === 0}
               className={`w-full py-4 font-bold uppercase tracking-widest transition-colors mb-6
                 ${(!isFormValid || loading || cartItems.length === 0) 
                   ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed' 
                   : 'bg-white text-black hover:bg-zinc-200 cursor-pointer'
                 }
               `}
             >
               {loading ? 'Ödeme Başlatılıyor...' : 'Ödemeye Geç'}
             </button>

             {/* --- GÜVEN ROZETİ (LOGO) --- */}
             <div className="flex flex-col items-center justify-center space-y-3 border-t border-zinc-800 pt-6 mt-6">
                
                <div className="flex items-center gap-2 text-zinc-500">
                    <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        256-Bit SSL Güvenli Ödeme
                    </span>
                </div>

                <div className="relative w-32 h-8 opacity-80 hover:opacity-100 transition-opacity duration-300">
                    <Image 
                        src="/iyzico.png" 
                        alt="Iyzico Güvencesi" 
                        fill 
                        className="object-contain" 
                    />
                </div>
                
                <span className="text-[12px] font-bold text-zinc-600 mt-1">
                    Altyapısıyla Korunmaktadır
                </span>
             </div>

          </div>

          <div id="iyzico-checkout-form" className="responsive mt-8"></div>
        </div>

      </div>
    </div>
  );
}