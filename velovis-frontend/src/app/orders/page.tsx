'use client';

import { useEffect, useState } from 'react';
import api from '../lib/api'; 
import Image from 'next/image';
import Link from 'next/link';

// Tip Tanımlamaları
interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    name: string;
    primaryPhotoUrl: string | null;
  };
}

interface Order {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Siparişleri Çek
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data);
      } catch (error) {
        console.error('Siparişler çekilemedi:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // İptal İşlemi
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Siparişi iptal etmek istediğinize emin misiniz? Stok iadesi yapılacaktır.')) return;

    try {
      await api.patch(`/orders/${orderId}/cancel`); 
      alert('Siparişiniz iptal edildi.');
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'İptal işlemi başarısız.');
    }
  };

  // Durum Kodlarını Minimalist Tasarıma Çeviren Fonksiyon
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PAID':
        return { text: 'Ödeme Alındı', color: 'text-green-500', dot: 'bg-green-500' };
      case 'PENDING':
        return { text: 'Beklemede', color: 'text-yellow-500', dot: 'bg-yellow-500' };
      case 'SHIPPED':
        return { text: 'Kargoya Verildi', color: 'text-blue-500', dot: 'bg-blue-500' };
      case 'DELIVERED':
        return { text: 'Teslim Edildi', color: 'text-zinc-400', dot: 'bg-zinc-400' };
      case 'CANCELLED':
        return { text: 'İptal Edildi', color: 'text-red-500', dot: 'bg-red-500' };
      case 'REFUNDED':
        return { text: 'İade Edildi', color: 'text-purple-500', dot: 'bg-purple-500' };
      default:
        return { text: status, color: 'text-white', dot: 'bg-white' };
    }
  };

  // Yükleniyor Durumu
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center pt-24">
         <div className="animate-pulse tracking-widest text-sm uppercase">Sipariş Geçmişi Yükleniyor...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pt-24 pb-20">
      <div className="container mx-auto px-6">
        
        {/* BAŞLIK ALANI */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-light tracking-tighter mb-4">
            SİPARİŞLERİM
          </h1>
          <div className="h-px w-full bg-zinc-800"></div>
          <div className="flex justify-between items-center mt-4 text-sm text-zinc-500 uppercase tracking-widest">
            <span>Geçmiş Siparişler</span>
            <span>{orders.length} Kayıt</span>
          </div>
        </div>

        {/* SİPARİŞ LİSTESİ VEYA BOŞ DURUM */}
        {orders.length === 0 ? (
          <div className="py-20 text-center space-y-6 border border-zinc-800 bg-zinc-900/20">
            <p className="text-xl font-light text-zinc-400">Henüz bir siparişiniz bulunmuyor.</p>
            <Link 
              href="/products" 
              className="inline-block border-b border-white pb-1 text-sm uppercase tracking-widest hover:text-zinc-400 transition-colors"
            >
              Koleksiyona Göz At →
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {orders.map((order) => {
              const statusInfo = getStatusDisplay(order.status);
              const canCancel = order.status === 'PAID' || order.status === 'PENDING';

              return (
                <div key={order.id} className="border border-zinc-800 bg-zinc-950">
                  
                  {/* 1. ÜST BİLGİ ÇUBUĞU */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-zinc-800 bg-zinc-900/30 gap-6">
                    
                    <div className="flex gap-8 md:gap-12">
                      {/* Tarih */}
                      <div>
                        <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                          Tarih
                        </span>
                        <span className="font-mono text-sm text-zinc-300">
                          {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      {/* Tutar */}
                      <div>
                        <span className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">
                          Toplam
                        </span>
                        <span className="font-mono text-sm text-white">
                          {Number(order.totalPrice).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </span>
                      </div>
                    </div>

                    {/* Durum */}
                    <div className="flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${statusInfo.dot} animate-pulse`}></span>
                       <span className={`text-sm uppercase tracking-widest font-bold ${statusInfo.color}`}>
                         {statusInfo.text}
                       </span>
                    </div>
                  </div>

                  {/* 2. ÜRÜNLER */}
                  <div className="p-6 space-y-6">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-6">
                        
                        {/* Resim */}
                        <div className="relative w-16 h-20 bg-zinc-900 flex-shrink-0">
                          <Image 
                            src={item.product?.primaryPhotoUrl || 'https://picsum.photos/100/120?grayscale'}
                            alt={item.product?.name || 'Ürün'}
                            fill
                            className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                          />
                        </div>

                        {/* Detaylar */}
                        <div className="flex-1 flex flex-col md:flex-row justify-between md:items-center gap-2">
                          <div>
                            <p className="text-white font-light text-lg">
                              {item.product?.name}
                            </p>
                            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
                              {item.quantity} Adet &bull; {Number(item.unitPrice).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </p>
                          </div>
                          
                          {/* Satır Toplamı (Mobilde gizlenebilir veya kalabilir) */}
                          <div className="text-right font-mono text-zinc-400 text-sm">
                            {(item.quantity * Number(item.unitPrice)).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* 3. ALT BİLGİ & AKSİYON */}
                  <div className="px-6 py-4 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-zinc-900/10">
                    <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                      ID: {order.id}
                    </div>

                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-xs font-bold text-red-500 uppercase tracking-widest border-b border-red-900/0 hover:border-red-500 transition-all pb-0.5"
                      >
                        Siparişi İptal Et
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}