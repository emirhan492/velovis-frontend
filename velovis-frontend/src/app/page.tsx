import ProductList from "@/components/ProductList"; // 1. ProductList'i import et

export default function HomePage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-blue-400">
        Velovis E-Ticaret Front-End
      </h1>
      
      {/* 2. Component'i buraya ekle */}
      <ProductList />
    </main>
  );
}