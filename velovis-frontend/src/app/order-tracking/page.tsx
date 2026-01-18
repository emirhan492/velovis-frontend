'use client';

import { useState } from 'react';
import Image from 'next/image';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Ödeme Bekleniyor',
  PAID: 'Sipariş Alındı',
  SHIPPED: 'Kargoya Verildi',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
  REFUNDED: 'İade Edildi',
};

export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Sipariş Sorgulama
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, email }),
      });

      if (!res.ok) {
        throw new Error('Sipariş bulunamadı veya bilgiler hatalı.');
      }

      const data = await res.json();
      console.log("GELEN SİPARİŞ VERİSİ:", data);
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sipariş İptal Etme
  const handleCancelOrder = async () => {
    if (!confirm('Siparişinizi iptal etmek istediğinize emin misiniz?')) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/guest-cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, email: email }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'İptal işlemi başarısız.');
      }

     
      setOrder({ ...order, status: 'CANCELLED' });
      alert('Siparişiniz başarıyla iptal edildi.');

    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  
  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      PAID: 'bg-green-500/10 text-green-500 border-green-500/20',
      SHIPPED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      DELIVERED: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
      CANCELLED: 'bg-red-500/10 text-red-500 border-red-500/20',
      REFUNDED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    };
    
    const activeStyle = styles[status as keyof typeof styles] || 'bg-zinc-800 text-white';
    const label = STATUS_LABELS[status] || status; 

    return (
      <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-sm ${activeStyle}`}>
        {label}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-black text-white pt-12 pb-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-widest mb-2">
            SİPARİŞ SORGULA
          </h1>
          <p className="text-zinc-500 text-xs md:text-sm">
            Sipariş numaranız ve e-posta adresinizle durum sorgulayın.
          </p>
        </div>

        {/* SORGULAMA FORMU */}
        <div className="mb-12">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="SİPARİŞ NUMARASI"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1 bg-transparent border border-zinc-800 p-4 text-sm text-white placeholder-zinc-600 focus:border-white focus:outline-none focus:ring-0 transition-colors tracking-wider"
              required
            />
            <input
              type="email"
              placeholder="E-POSTA ADRESİ"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent border border-zinc-800 p-4 text-sm text-white placeholder-zinc-600 focus:border-white focus:outline-none focus:ring-0 transition-colors tracking-wider"
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-white text-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? 'SORGULANIYOR...' : 'SORGULA'}
            </button>
          </form>
          
          {error && (
            <div className="mt-6 p-4 border border-red-900/50 bg-red-900/10 text-red-500 text-center text-sm">
              {error}
            </div>
          )}
        </div>

        {/* SONUÇ EKRANI */}
        {order && (
          <div className="border border-zinc-800 bg-zinc-900/30 p-6 md:p-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-6 mb-6 gap-4">
              <div>
                <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Sipariş Tarihi</p>
                <p className="text-sm font-medium text-zinc-300">
                  {new Date(order.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                   <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Toplam Tutar</p>
                   <p className="text-lg font-bold">₺{Number(order.totalPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="pl-4 border-l border-zinc-800">
                  {getStatusBadge(order.status)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {order.items.map((item: any) => {
                const imageUrl = item.product.primaryPhotoUrl || (item.product.photos && item.product.photos.length > 0 ? item.product.photos[0].url : null);

                return (
                  <div key={item.id} className="flex justify-between items-center py-4 border-b border-zinc-800/50 last:border-0">
                    <div className="flex items-center gap-4">
                      
                      <div className="relative w-16 h-20 bg-zinc-800 flex-shrink-0 border border-zinc-700 overflow-hidden">
                        {imageUrl ? (
                          <Image 
                            src={imageUrl} 
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <span className="text-[10px]">IMG</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-white text-sm">{item.product.name}</p>
                        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">
                          BEDEN: {item.size} <span className="mx-2">•</span> ADET: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-zinc-300">
                      ₺{Number(item.unitPrice).toLocaleString('tr-TR')}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* BUTON */}
            {(order.status === 'PAID' || order.status === 'PENDING') && (
              <div className="mt-8 pt-6 border-t border-zinc-800 text-right">
                <button 
                  onClick={handleCancelOrder}
                  disabled={actionLoading}
                  className="text-red-500 text-xs uppercase tracking-widest border border-red-900/30 px-4 py-2 hover:bg-red-900/10 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'İptal Ediliyor...' : 'Siparişi İptal Et'}
                </button>
              </div>
            )}
            

          </div>
        )}
      </div>
    </main>
  );
}