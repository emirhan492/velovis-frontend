'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from 'src/app/lib/api'; 
import RoleManager from '../../../components/admin/RoleManager'; 
import UserManager from '../../../components/admin/UserManager';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    dailyOrders: 0,   
    dailyRevenue: 0,  
    pendingOrders: 0, 
    shippedOrders: 0, 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/orders/admin/all');
        
        // ---  BUGÜNÜN BAŞLANGIÇ ZAMANINI BELİRLE ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // --- SİPARİŞLERİ FİLTRELE ---
        const todaysOrders = data.filter((order: any) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= today;
        });

        // --- GÜNLÜK İSTATİSTİKLERİ HESAPLA ---
        const dailyRevenue = todaysOrders.reduce((sum: number, order: any) => sum + Number(order.totalPrice), 0);
        const dailyOrders = todaysOrders.length;

        // --- GENEL DURUM ---
        const pendingOrders = data.filter((order: any) => order.status === 'PAID' || order.status === 'PENDING').length;
        const shippedOrders = data.filter((order: any) => order.status === 'SHIPPED').length;

        setStats({
          dailyOrders,
          dailyRevenue,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse tracking-widest text-sm uppercase">Panel Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black pt-24 pb-20">
      <div className="container mx-auto px-6">
        
        {/* BAŞLIK */}
        <div className="flex justify-between items-end mb-12 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-light tracking-tighter uppercase">Yönetim Paneli</h1>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-2">Genel Bakış & İstatistikler</p>
          </div>
          <div className="text-right">
             <span className="text-xs font-bold bg-white text-black px-3 py-1 uppercase tracking-widest">Admin</span>
          </div>
        </div>

        {/* --- BÖLÜM 1: İSTATİSTİKLER --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          
          <div className="border border-zinc-800 bg-zinc-950 p-6 group hover:border-zinc-600 transition-colors">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Günlük Ciro</h3>
            <p className="text-2xl font-mono text-green-500">
              {stats.dailyRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </p>
          </div>

          <div className="border border-zinc-800 bg-zinc-950 p-6 group hover:border-zinc-600 transition-colors">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Günlük Sipariş</h3>
            <p className="text-2xl font-mono text-white">{stats.dailyOrders}</p>
          </div>

          <div className="border border-zinc-800 bg-zinc-950 p-6 group hover:border-zinc-600 transition-colors">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Kargolanacak</h3>
            <p className="text-2xl font-mono text-yellow-500">{stats.pendingOrders}</p>
          </div>

          <div className="border border-zinc-800 bg-zinc-950 p-6 group hover:border-zinc-600 transition-colors">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Kargoda</h3>
            <p className="text-2xl font-mono text-blue-500">{stats.shippedOrders}</p>
          </div>
        </div>

        {/* --- BÖLÜM 2: HIZLI ERİŞİM --- */}
        <div className="mb-16">
           <Link 
            href="/admin/orders"
            className="block w-full border border-zinc-800 bg-zinc-900/30 p-8 hover:bg-zinc-900 hover:border-zinc-600 transition-all group"
          >
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-light uppercase tracking-widest text-white mb-2">Sipariş Yönetimi</h2>
                    <p className="text-xs text-zinc-500">Tüm siparişleri listele, durumlarını güncelle ve kargo takibi yap.</p>
                </div>
                <span className="text-2xl text-zinc-600 group-hover:text-white transition-colors">→</span>
            </div>
          </Link>
        </div>

        {/* --- BÖLÜM 3: YÖNETİM ARAÇLARI --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="border border-zinc-800 bg-zinc-950">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/20 flex justify-between items-center">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Rol Yönetimi</h2>
              <span className="text-[10px] text-zinc-600 uppercase">Sistem Yetkileri</span>
            </div>
            <div className="p-6">
               <RoleManager />
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-950">
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/20 flex justify-between items-center">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Kullanıcı Yönetimi</h2>
              <span className="text-[10px] text-zinc-600 uppercase">Üye Listesi</span>
            </div>
            <div className="p-6">
               <UserManager />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}