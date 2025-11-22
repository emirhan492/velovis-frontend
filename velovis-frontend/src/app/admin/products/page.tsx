"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "src/app/lib/api";
import { TrashIcon, PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline";

interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  primaryPhotoUrl: string | null;
  category: { name: string };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (error) {
      console.error("Ürünler çekilemedi", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      alert("Silme işlemi başarısız.");
    }
  };

  // 👇 YARDIMCI FONKSİYON: URL DÜZELTİCİ (HATA ÇÖZÜMÜ BURADA)
  const getValidImageUrl = (url: string | null) => {
    if (!url) return "https://via.placeholder.com/150"; // Resim yoksa placeholder
    if (url.startsWith("http")) return url; // Dış linkse (Unsplash vb.) dokunma
    if (url.startsWith("/")) return url; // Zaten başında / varsa dokunma
    return `/${url}`; // Başında / yoksa ekle (pics/ceket.jpg -> /pics/ceket.jpg)
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-8 pt-24 animate-pulse">YÜKLENİYOR...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24 font-sans">
      <div className="container mx-auto">
        
        {/* Üst Bar */}
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
          <h1 className="text-3xl font-light tracking-tighter uppercase">Ürün Yönetimi</h1>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
          >
            <PlusIcon className="w-4 h-4" /> Yeni Ürün Ekle
          </Link>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto border border-zinc-800">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-900 text-xs uppercase tracking-widest text-zinc-500">
              <tr>
                <th className="p-4 font-medium">Görsel</th>
                <th className="p-4 font-medium">Ürün Adı</th>
                <th className="p-4 font-medium">Kategori</th>
                <th className="p-4 font-medium">Fiyat</th>
                <th className="p-4 font-medium">Stok</th>
                <th className="p-4 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-16 relative bg-zinc-800 overflow-hidden">
                      <Image
                        // 👇 BURADA DÜZELTİCİ FONKSİYONU KULLANDIK
                        src={getValidImageUrl(product.primaryPhotoUrl)}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="p-4 text-white font-medium">{product.name}</td>
                  <td className="p-4">{product.category?.name || '-'}</td>
                  <td className="p-4 font-mono text-white">
                    ₺{Number(product.price).toLocaleString("tr-TR")}
                  </td>
                  <td className="p-4">
                    {product.stockQuantity > 0 ? (
                      <span className="text-green-500">{product.stockQuantity} Adet</span>
                    ) : (
                      <span className="text-red-500">Tükendi</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-4">
                    <Link 
                      href={`/admin/products/${product.id}/edit`}
                      className="inline-block text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}