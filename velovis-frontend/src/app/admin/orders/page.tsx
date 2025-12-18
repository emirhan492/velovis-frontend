'use client';

import { useEffect, useState } from 'react';
import api from 'src/app/lib/api';
import Image from 'next/image';

interface AdminOrder {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  user: { fullName: string; email: string };
  // Adres Alanları
  contactName: string | null;
  city: string | null;
  district: string | null;
  phone: string | null;
  address: string | null;
  
  items: {
    id: string;
    quantity: number;
    product: { name: string; primaryPhotoUrl: string | null };
  }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/admin/all');
      setOrders(data);
    } catch (error) {
      console.error('Hata:', error);
      alert('Siparişler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  // Durum Güncelleme
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!confirm(`Durum "${newStatus}" olarak değiştirilecek. Emin misin?`)) return;
    try {
      await api.patch(`/orders/${orderId}`, { status: newStatus });
      fetchOrders(); 
    } catch (error) {
      alert('Güncelleme başarısız.');
    }
  };

  // İade İşlemi
  const handleRefund = async (orderId: string) => {
    if (!confirm('UYARI: Para iadesi başlatılacak. Onaylıyor musunuz?')) return;
    try {
      await api.post(`/orders/${orderId}/refund`);
      alert('İade işlemi başlatıldı.');
      fetchOrders();
    } catch (error: any) {
      alert('Hata: ' + (error.response?.data?.message || 'Bilinmeyen hata'));
    }
  };

  const getValidImageUrl = (url: string | null) => {
    if (!url) return "https://via.placeholder.com/150";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return url;
    return `/${url}`;
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-500 border-green-500/50 bg-green-500/10';
      case 'SHIPPED': return 'text-blue-500 border-blue-500/50 bg-blue-500/10';
      case 'DELIVERED': return 'text-zinc-400 border-zinc-500/50 bg-zinc-500/10';
      case 'CANCELLED': return 'text-red-500 border-red-500/50 bg-red-500/10';
      case 'REFUNDED': return 'text-purple-500 border-purple-500/50 bg-purple-500/10';
      default: return 'text-white border-white/50 bg-white/10';
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center pt-24 animate-pulse text-sm uppercase tracking-widest">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pt-24 pb-20">
      <div className="container mx-auto px-6">
        
        {/* BAŞLIK */}
        <div className="flex justify-between items-end mb-12 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-light tracking-tighter uppercase">Sipariş Yönetimi</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Admin Paneli</p>
          </div>
          <span className="text-xs font-bold bg-white text-black px-3 py-1 uppercase tracking-widest">
            {orders.length} Kayıt
          </span>
        </div>
        
        {/* TABLO */}
        <div className="overflow-x-auto border border-zinc-800">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-900 text-xs uppercase tracking-widest text-zinc-500">
              <tr>
                <th className="p-4 font-medium w-1/4">Ürünler</th>
                <th className="p-4 font-medium">Alıcı / İletişim</th>
                <th className="p-4 font-medium w-1/4">Teslimat Adresi</th>
                <th className="p-4 font-medium">Tarih</th>
                <th className="p-4 font-medium">Tutar</th>
                <th className="p-4 font-medium">Durum</th>
                <th className="p-4 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-20 text-zinc-600 font-light">Henüz sipariş yok.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-900/30 transition-colors group">
                    
                    {/* 1. ÜRÜNLER */}
                    <td className="p-4 align-top">
                      <div className="flex flex-col space-y-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3">
                            <div className="relative w-10 h-12 bg-zinc-800 flex-shrink-0">
                              <Image 
                                src={getValidImageUrl(item.product?.primaryPhotoUrl)}
                                alt="Ürün" fill className="object-cover grayscale group-hover:grayscale-0 transition-all"
                              />
                            </div>
                            <div>
                              <p className="text-white text-xs font-bold uppercase tracking-wide line-clamp-1">{item.product?.name}</p>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{item.quantity} Adet</p>
                            </div>
                          </div>
                        ))}
                        <span className="text-[10px] text-zinc-700 font-mono pt-2 select-all">ID: {order.id}</span>
                      </div>
                    </td>

                    {/* 2. ALICI / İLETİŞİM */}
                    <td className="p-4 align-top">
                      <div className="flex flex-col space-y-1">
                        <span className="text-white font-medium">
                            {order.contactName || order.user?.fullName}
                        </span>
                        <span className="text-xs text-blue-400 font-mono tracking-wide">
                            {order.phone || 'Telefon Yok'}
                        </span>
                        <span className="text-[10px] text-zinc-600 font-mono">
                           {order.user?.email}
                        </span>
                      </div>
                    </td>

                    {/* 3. TESLİMAT ADRESİ */}
                    <td className="p-4 align-top">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-700 pb-1 w-fit">
                                {order.city || 'İL'} / {order.district || 'İLÇE'}
                            </span>
                            <span className="text-xs text-zinc-400 leading-relaxed break-words">
                                {order.address || 'Açık adres bulunamadı.'}
                            </span>
                        </div>
                    </td>

                    {/* 4. TARİH */}
                    <td className="p-4 align-top font-mono text-xs text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      <br/>
                      {new Date(order.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                    </td>

                    {/* 5. TUTAR */}
                    <td className="p-4 align-top font-mono text-white">
                      {Number(order.totalPrice).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </td>

                    {/* 6. DURUM (DÜZELTİLDİ: whitespace-nowrap eklendi) */}
                    <td className="p-4 align-top">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap ${getStatusStyle(order.status)}`}>
                        {order.status === 'PAID' ? 'Ödeme Alındı' :
                         order.status === 'SHIPPED' ? 'Kargoda' :
                         order.status === 'DELIVERED' ? 'Teslim Edildi' :
                         order.status === 'CANCELLED' ? 'İptal Edildi' :
                         order.status === 'REFUNDED' ? 'İade Edildi' : order.status}
                      </span>
                    </td>
                    
                    {/* 7. İŞLEMLER */}
                    <td className="p-4 align-top text-right space-y-2">
                      {order.status === 'PAID' && (
                        <button onClick={() => handleStatusChange(order.id, 'SHIPPED')} className="block w-full text-right text-xs font-bold text-blue-500 uppercase tracking-widest hover:text-white transition-colors">
                          Kargola →
                        </button>
                      )}
                      
                      {order.status === 'SHIPPED' && (
                        <>
                          <button onClick={() => handleStatusChange(order.id, 'DELIVERED')} className="block w-full text-right text-xs font-bold text-green-500 uppercase tracking-widest hover:text-white transition-colors mb-2">Teslim Et ✓</button>
                          <button onClick={() => handleStatusChange(order.id, 'PAID')} className="block w-full text-right text-[10px] text-zinc-500 hover:text-zinc-300 uppercase tracking-widest">↩ Geri Al</button>
                        </>
                      )}

                      {(order.status === 'CANCELLED' || order.status === 'PAID') && (
                          <button onClick={() => handleRefund(order.id)} className="block w-full text-right text-xs font-bold text-purple-500 uppercase tracking-widest hover:text-white transition-colors">
                            İade Yap
                          </button>
                      )}

                      {order.status === 'REFUNDED' && (
                          <span className="block w-full text-right text-[10px] text-zinc-600 uppercase tracking-widest">İşlem Tamam</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}