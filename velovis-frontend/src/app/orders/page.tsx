"use client"; // Veri çekme (useQuery) ve hook'lar için

import { useQuery } from "@tanstack/react-query";
import api from "../lib/api"; // Bizim akıllı API istemcimiz
import Link from "next/link"; // (Opsiyonel, sipariş detayına link için)

// Backend'deki Order (Sipariş) tipimizi tanımlayalım
type Order = {
  id: string;
  totalPrice: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string; // Tarih string olarak gelir
};

// =================================================================
// VERİ ÇEKME FONKSİYONU
// =================================================================
const fetchMyOrders = async (): Promise<Order[]> => {
  // api.ts'teki 'interceptor' (yakalayıcı) bu isteğe
  // 'accessToken'ı otomatik olarak ekleyecektir.
  const { data } = await api.get('/orders');
  return data;
};

// =================================================================
// ANA SAYFA COMPONENT'İ
// =================================================================
export default function OrdersPage() {
  
  // 1. TanStack Query ile siparişlerimizi çek
  const { 
    data: orders, 
    isLoading, 
    error 
  } = useQuery<Order[]>({
    queryKey: ['myOrders'], // Bu verinin cache'teki anahtarı
    queryFn: fetchMyOrders,
  });

  // Durum çevirileri (güzellik için)
  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'PENDING': return 'Onay Bekliyor';
      case 'PAID': return 'Ödendi';
      case 'SHIPPED': return 'Kargolandı';
      case 'DELIVERED': return 'Teslim Edildi';
      case 'CANCELLED': return 'İptal Edildi';
      default: return status;
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-400">Siparişlerim</h1>

      {isLoading && <p className="mt-4 text-yellow-400">Siparişler yükleniyor...</p>}
      {error && <p className="mt-4 text-red-500">Hata: {(error as any).message}</p>}

      {orders && orders.length === 0 && (
        <p className="mt-4 text-gray-400">Henüz hiç sipariş vermemişsiniz.</p>
      )}

      {/* Siparişler listesi (tablo olarak) */}
      {orders && orders.length > 0 && (
         <div className="mt-8 flex flex-col">
            <div className="-my-2 overflow-x-auto">
              <div className="inline-block min-w-full py-2 align-middle">
                <div className="overflow-hidden rounded-lg shadow ring-1 ring-black ring-opacity-5">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                          Sipariş ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                          Tarih
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                          Durum
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">
                          Toplam Fiyat
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Detay</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 bg-gray-900">
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">{order.id.split('-')[0]}...</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                            {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-yellow-400">
                            {getStatusLabel(order.status)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-green-500">
                            {order.totalPrice.toFixed(2)} TL
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                            {/* TODO: /orders/:id sayfası yapılınca burası aktif edilecek */}
                            {/* <Link href={`/orders/${order.id}`} className="text-blue-500 hover:text-blue-400">
                              Detay Gör
                            </Link> */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
      )}
    </main>
  );
}