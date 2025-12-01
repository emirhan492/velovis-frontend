"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from 'src/app/lib/store/auth.store';
import { useCartStore } from 'src/app/lib/store/cart.store';
import api from 'src/app/lib/api';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon, ShoppingBagIcon, UserIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const PERMISSIONS = {
  ROLES: {
    READ: 'roles:read',
  },
};

export default function Header() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const tokens = useAuthStore((state) => state.tokens);
  const logout = useAuthStore((state) => state.logout);

  const cartItems = useCartStore((state) => state.items);
  const totalItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const router = useRouter();
  const hasAdminAccess = user?.permissions?.includes(PERMISSIONS.ROLES.READ);

  const handleLogout = async () => {
    if (!tokens) return;
    try {
      await api.post('/auth/logout', { refreshToken: tokens.refreshToken });
    } catch (error) {
      console.error("Logout hatası:", error);
    } finally {
      logout();
      router.push('/');
    }
  };

  return (
    <header className="bg-black/90 backdrop-blur-md border-b border-zinc-900 sticky top-0 z-50 transition-all duration-300">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        
        {/* 1. LOGO (SOL) */}
        <Link href="/" className="relative block w-32 h-8 md:w-40 md:h-10 md:-ml-8 hover:opacity-80 transition-opacity">

          <Image 
            src="/pics/header_logo.png" 
            alt="Velovis Logo" 
            fill 
            className="object-contain object-left" 
            priority 
          />
        </Link>

        {/* 2. SAĞ TARAF (LİNKLER + SEPET + PROFİL) */}
        <div className="flex items-center gap-4 md:gap-8">
          
          {/* --- MENÜ LİNKLERİ --- */}
          
          {/* Koleksiyon: SADECE BİLGİSAYARDA GÖRÜNSÜN (hidden md:block) */}
          <Link href="/products" className="hidden md:block text-[10px] md:text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors font-bold">
            Koleksiyon
          </Link>

          {/* Hakkında */}
          <Link href="/about" className="text-[10px] md:text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors font-bold">
            Hakkında
          </Link>

          {/* AYIRAÇ ÇİZGİSİ */}
          <div className="h-4 w-px bg-zinc-800"></div>

          {/* --- SEPET --- */}
          <Link href="/cart" className="text-zinc-400 hover:text-white relative transition-colors group flex items-center gap-1">
            <ShoppingBagIcon className="w-5 h-5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[8px] font-bold text-black shadow-sm">
                {totalItemCount}
              </span>
            )}
          </Link>

          {/* --- PROFİL / GİRİŞ --- */}
          {isAuthenticated && user ? (
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="flex items-center text-zinc-400 hover:text-white focus:outline-none transition-colors">
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden md:inline-block ml-2 text-xs font-medium uppercase tracking-widest max-w-[200px] truncate">
                    {user.fullName}
                  </span>
                  <ChevronDownIcon className="hidden md:block h-3 w-3 ml-1 text-zinc-500" aria-hidden="true" />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-4 w-56 origin-top-right divide-y divide-zinc-800 rounded-sm border border-zinc-800 bg-black shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  
                  {/* ADMIN */}
                  {hasAdminAccess && (
                    <div className="px-1 py-1 bg-zinc-900/50">
                      <Menu.Item>
                        {({ active }) => (
                          <Link href="/admin/dashboard" className={`${active ? 'bg-white text-black' : 'text-zinc-300'} group flex w-full items-center px-4 py-3 text-xs uppercase tracking-widest transition-colors`}>
                            Admin Paneli
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link href="/admin/products" className={`${active ? 'bg-white text-black' : 'text-zinc-300'} group flex w-full items-center px-4 py-3 text-xs uppercase tracking-widest transition-colors`}>
                            Ürün Yönetimi
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link href="/admin/orders" className={`${active ? 'bg-white text-black' : 'text-zinc-300'} group flex w-full items-center px-4 py-3 text-xs uppercase tracking-widest transition-colors`}>
                            Sipariş Yönetimi
                          </Link>
                        )}
                      </Menu.Item>
                    </div>
                  )}

                  {/* KULLANICI */}
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link href="/orders" className={`${active ? 'bg-zinc-900 text-white' : 'text-zinc-400'} group flex w-full items-center px-4 py-3 text-xs uppercase tracking-widest transition-colors`}>
                          Siparişlerim
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link href="/account" className={`${active ? 'bg-zinc-900 text-white' : 'text-zinc-400'} group flex w-full items-center px-4 py-3 text-xs uppercase tracking-widest transition-colors`}>
                          Hesabım
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                  
                  <div className="py-1 border-t border-zinc-800">
                    <Menu.Item>
                      {({ active }) => (
                        <button onClick={handleLogout} className={`${active ? 'bg-red-900/20 text-red-400' : 'text-red-500'} group flex w-full items-center px-4 py-3 text-xs uppercase tracking-widest transition-colors`}>
                          Çıkış Yap
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : (
            // GİRİŞ YAPMAMIŞ
            <div className="flex items-center space-x-4 text-[10px] md:text-xs uppercase tracking-widest">
              <Link href="/login" className="text-zinc-400 hover:text-white transition-colors font-bold">Giriş</Link>
              <Link href="/register" className="border border-white px-3 py-1.5 text-white hover:bg-white hover:text-black transition-all duration-300 font-bold">
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
