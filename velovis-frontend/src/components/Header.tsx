"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from 'src/app/lib/store/auth.store';
import { useCartStore } from 'src/app/lib/store/cart.store';
import api from 'src/app/lib/api';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

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
    // TEMA GÜNCELLEMESİ: bg-black, border-zinc-900 (Siyah ve İnce Çizgili)
    <header className="bg-black/90 backdrop-blur-md border-b border-zinc-900 sticky top-0 z-50 transition-all duration-300">
      <nav className="container mx-auto flex items-center justify-between px-6 py-4">
        
        {/* 1. LOGO: Yeni Minimal Font */}
        <Link href="/" className="text-2xl font-light tracking-[0.2em] text-white uppercase hover:opacity-80 transition-opacity">
          Velovis
        </Link>

        {/* 2. ORTA MENÜ (YENİ EKLENDİ) */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/products" className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
            Koleksiyon
          </Link>
          <Link href="/about" className="text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
            Hakkında
          </Link>
        </div>

        {/* 3. SAĞ TARAF (Sepet & Profil) */}
        <div className="flex items-center space-x-6">
          
          {/* SEPET */}
          <Link href="/cart" className="text-zinc-400 hover:text-white relative transition-colors group">
            <span className="text-xs uppercase tracking-widest group-hover:underline underline-offset-4">Sepet</span>
            {totalItemCount > 0 && (
              // TEMA GÜNCELLEMESİ: Mavi top yerine Beyaz top, siyah yazı
              <span className="absolute -top-3 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black shadow-sm">
                {totalItemCount}
              </span>
            )}
          </Link>

          {/* PROFİL MENÜSÜ */}
          {isAuthenticated && user ? (
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex w-full justify-center items-center text-xs font-medium uppercase tracking-widest text-zinc-400 hover:text-white focus:outline-none transition-colors">
                  <span className="mr-1 max-w-[100px] truncate">{user.fullName}</span>
                  <ChevronDownIcon className="h-4 w-4 text-zinc-500 group-hover:text-white" aria-hidden="true" />
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
                {/* TEMA GÜNCELLEMESİ: Dropdown Siyah/Gri */}
                <Menu.Items className="absolute right-0 mt-4 w-56 origin-top-right divide-y divide-zinc-800 rounded-none border border-zinc-800 bg-black shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  
                  {/* ADMIN BÖLÜMÜ */}
                  {hasAdminAccess && (
                    <div className="px-1 py-1 bg-zinc-900/50">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/admin/dashboard"
                            className={`${
                              active ? 'bg-white text-black' : 'text-zinc-300'
                            } group flex w-full items-center px-4 py-3 text-xs uppercase tracking-widest transition-colors`}
                          >
                            Admin Paneli
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href="/admin/orders"
                            className={`${
                              active ? 'bg-white text-black' : 'text-zinc-300'
                            } group flex w-full items-center px-4 py-3 text-xs uppercase tracking-widest transition-colors`}
                          >
                            Sipariş Yönetimi
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
      {({ active }) => (
        <Link
          href="/admin/products"
          className={`${
            active ? 'bg-white text-black' : 'text-zinc-300'
          } group flex w-full items-center px-4 py-3 text-xs uppercase tracking-widest transition-colors`}
        >
          Ürün Yönetimi
        </Link>
      )}
    </Menu.Item>
                    </div>
                  )}

                  {/* KULLANICI BÖLÜMÜ */}
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/orders"
                          className={`${
                            active ? 'bg-zinc-900 text-white' : 'text-zinc-400'
                          } group flex w-full items-center px-4 py-3 text-xs uppercase tracking-widest transition-colors`}
                        >
                          Siparişlerim
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/account"
                          className={`${
                            active ? 'bg-zinc-900 text-white' : 'text-zinc-400'
                          } group flex w-full items-center px-4 py-3 text-xs uppercase tracking-widest transition-colors`}
                        >
                          Hesabım
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                  
                  <div className="py-1 border-t border-zinc-800">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-red-900/20 text-red-400' : 'text-red-500'
                          } group flex w-full items-center px-4 py-3 text-xs uppercase tracking-widest transition-colors`}
                        >
                          Çıkış Yap
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          ) : (
            // GİRİŞ YAPMAMIŞ KULLANICI
            <div className="flex items-center space-x-6 text-xs uppercase tracking-widest">
              <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">Giriş</Link>
              <Link href="/register" className="border border-white px-4 py-2 text-white hover:bg-white hover:text-black transition-all duration-300">
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}