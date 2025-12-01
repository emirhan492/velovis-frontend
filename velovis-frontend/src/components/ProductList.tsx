"use client"; 

import api from "../app/lib/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  slug: string;
};

const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await api.get('/products'); 
  return data;
};

export default function ProductList() {
  
  const { data: products, isLoading, isError, error } = useQuery({
    queryKey: ['products'], 
    queryFn: fetchProducts, 
  });



  // Yüklenme durumu
  if (isLoading) {
    return <div className="text-yellow-400">Ürünler Yükleniyor...</div>;
  }

  // Hata durumu
  if (isError) {
    return <div className="text-red-500">Hata: {error.message}</div>;
  }
  
  // Veri başarıyla geldiyse
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold text-green-400">Ürünlerimiz</h2>
      

      {products && products.length > 0 ? (
        <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {products.map((product) => (
            <Link href={`/products/${product.slug}`} key={product.id}>
              <li className="rounded border border-gray-700 bg-gray-800 p-4 transition-transform duration-200 hover:scale-105 hover:border-blue-500">
                <h3 className="text-xl font-bold">{product.name}</h3>
                <p className="mt-2 text-lg text-green-500">{product.price} TL</p>
                <p className="text-sm text-gray-400">Stok: {product.stockQuantity}</p>
              </li>
            </Link>
          ))}
        </ul>
      ) : (
        <p>Gösterilecek ürün bulunamadı.</p>
      )}
    </div>
  );
}