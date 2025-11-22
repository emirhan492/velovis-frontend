"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "src/app/lib/api";
import ProductForm from "../../form";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (id) {
      api.get(`/products/${id}`).then((res) => setProduct(res.data));
    }
  }, [id]);

  if (!product) return <div className="min-h-screen bg-black text-white p-8 pt-24">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24">
      <div className="container mx-auto">
        <h1 className="text-2xl font-light uppercase tracking-widest mb-8 border-b border-zinc-800 pb-4">
          Ürünü Düzenle
        </h1>
        <ProductForm initialData={product} />
      </div>
    </div>
  );
}