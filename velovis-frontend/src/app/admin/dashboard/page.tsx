'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
// Dosya yolları projenizin yapısına uygun (relative) şekilde ayarlandı:
import api from 'src/app/lib/api'; 
import RoleManager from '../../../components/admin/RoleManager'; // Üzgünüm, dosya yolu hatalı oldu.
import UserManager from '../../../components/admin/UserManager'; // Üzgünüm, dosya yolu hatalı oldu.
export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    shippedOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Backend'den tüm siparişleri çekip istatistik hesaplıyoruz
        const { data } = await api.get('/orders/admin/all');
        
        const totalRevenue = data.reduce((sum: number, order: any) => sum + Number(order.totalPrice), 0);
        const pendingOrders = data.filter((order: any) => order.status === 'PAID' || order.status === 'PENDING').length;
        const shippedOrders = data.filter((order: any) => order.status === 'SHIPPED').length;

        setStats({
          totalOrders: data.length,
          totalRevenue,
          pendingOrders,
          shippedOrders,
        });
      } catch (error) {
        console.error('İstatistikler yüklenemedi', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center text-white mt-10">Yükleniyor...</div>;

  return (
    <div className="container mx-auto p-4 mt-8">
      <h1 className="text-3xl font-bold text-white mb-8 border-b border-gray-700 pb-4">
        Admin Yönetim Paneli
      </h1>

      {/* --- BÖLÜM 1: İSTATİSTİKLER (Yeni Tasarım) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        
        {/* Toplam Ciro */}
        <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Toplam Ciro</h3>
          <p className="text-2xl font-bold text-green-400 mt-2">
            {stats.totalRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
          </p>
        </div>

        {/* Toplam Sipariş */}
        <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Toplam Sipariş</h3>
          <p className="text-2xl font-bold text-white mt-2">{stats.totalOrders}</p>
        </div>

        {/* Bekleyen Siparişler */}
        <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Kargolanacak</h3>
          <p className="text-2xl font-bold text-yellow-400 mt-2">{stats.pendingOrders}</p>
        </div>

        {/* Kargodaki Siparişler */}
        <div className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">Kargoda</h3>
          <p className="text-2xl font-bold text-blue-400 mt-2">{stats.shippedOrders}</p>
        </div>
      </div>

      {/* --- BÖLÜM 2: YÖNETİM ARAÇLARI (Eski Özelliklerin Entegrasyonu) --- */}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        
        {/* Rol Yönetimi */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="bg-gray-700/50 px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              🛡️ Rol Yönetimi
            </h2>
            <p className="text-xs text-gray-400 mt-1">Sistemdeki rolleri ve yetkileri düzenleyin.</p>
          </div>
          <div className="p-6">
             <RoleManager />
          </div>
        </div>

        {/* Kullanıcı Yönetimi */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="bg-gray-700/50 px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              👥 Kullanıcı Yönetimi
            </h2>
            <p className="text-xs text-gray-400 mt-1">Kullanıcılara rol atayın veya düzenleyin.</p>
          </div>
          <div className="p-6">
             <UserManager />
          </div>
        </div>

      </div>

       {/* --- BÖLÜM 3: HIZLI ERİŞİM --- */}
       <div>
         <Link 
          href="/admin/orders"
          className="block w-full bg-gradient-to-r from-blue-900 to-gray-800 hover:from-blue-800 hover:to-gray-700 border border-blue-800/50 p-6 rounded-lg transition text-center group"
        >
          <span className="text-blue-300 font-bold text-xl group-hover:text-white transition-colors">
            📦 Detaylı Sipariş Yönetimi Tablosuna Git &rarr;
          </span>
          <p className="text-sm text-gray-400 mt-2">Tüm siparişleri listele, durumlarını güncelle ve kargo takibi yap.</p>
        </Link>
       </div>

    </div>
  );
}