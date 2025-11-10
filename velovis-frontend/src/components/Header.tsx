"use client"; 

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../app/lib/store/auth.store'; 
import { useCartStore } from '../app/lib/store/cart.store';
import api from '../app/lib/api'; 
import { Menu, Transition } from '@headlessui/react'; // 1. Headless UI'ı import et
import { Fragment } from 'react'; // 2. Fragment'i import et
import { ChevronDownIcon } from '@heroicons/react/20/solid'; // 3. Küçük bir ok ikonu (opsiyonel ama güzel)

// İkon kütüphanesi yüklü değilse yükleyelim:
// Terminalde: npm install @heroicons/react

// (PERMISSIONS objesi burada durabilir, değişmedi)
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

  const hasAdminAccess = user?.permissions.includes(PERMISSIONS.ROLES.READ);

  const handleLogout = async () => {
    if (!tokens) return; 
    try {
      await api.post('/auth/logout', { refreshToken: tokens.refreshToken });
    } catch (error) {
      console.error("Logout sırasında backend'de hata oluştu:", error);
    } finally {
      logout();
      router.push('/');
    }
  };

  return (
    <header className="bg-gray-800 shadow-md">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold text-blue-400">
          Velovis
        </Link>

        <div className="flex items-center space-x-6"> {/* Aralığı biraz açtık */}
          
          <Link href="/cart" className="text-gray-300 hover:text-white relative">
            Sepet ({totalItemCount})
            {totalItemCount > 0 && (
              <span className="absolute -top-2 -right-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                {totalItemCount}
              </span>
            )}
          </Link>

          {/* === ADMİN PANELİ LİNKİ (Değişmedi) === */}
          {isAuthenticated && hasAdminAccess && (
            <Link 
              href="/admin/dashboard" 
              className="rounded-md bg-green-600 px-3 py-1 text-sm font-bold text-white hover:bg-green-700"
            >
              Admin Paneli
            </Link>
          )}

          {isAuthenticated && user ? (
            // =================================================================
            // === DEĞİŞİKLİK BURADA BAŞLIYOR (DROPDOWN MENÜ) ===
            // =================================================================
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex w-full justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none">
                  Merhaba, {user.fullName}
                  <ChevronDownIcon
                    className="-mr-1 ml-2 h-5 w-5"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>

              {/* Açılır menü geçişi (animasyonlu) */}
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-600 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/account"
                          className={`${
                            active ? 'bg-blue-600 text-white' : 'text-gray-300'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          Hesabım
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/orders"
                          className={`${
                            active ? 'bg-blue-600 text-white' : 'text-gray-300'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          Siparişlerim
                        </Link>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`${
                            active ? 'bg-red-600 text-white' : 'text-red-400'
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          Çıkış Yap
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            // =================================================================
            // === DEĞİŞİKLİK BURADA BİTİYOR ===
            // =================================================================
          ) : (
            // Giriş yapmamışsa:
            <>
              <Link href="/login" className="text-gray-300 hover:text-white">
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}