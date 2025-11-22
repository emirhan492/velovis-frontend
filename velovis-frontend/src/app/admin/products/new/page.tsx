"use client";
import ProductForm from "../form";

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24">
      <div className="container mx-auto">
        <h1 className="text-2xl font-light uppercase tracking-widest mb-8 border-b border-zinc-800 pb-4">
          Yeni Ürün Ekle
        </h1>
        <ProductForm />
      </div>
    </div>
  );
}