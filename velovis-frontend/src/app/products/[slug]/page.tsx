"use client"; 

import { useParams, useRouter } from 'next/navigation'; 
import api from 'src/app/lib/api'; 
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react'; 
import { useAuthStore } from 'src/app/lib/store/auth.store'; 
import { useCartStore } from 'src/app/lib/store/cart.store'; 

// ... (Product tipi ve fetchProductBySlug fonksiyonu aynı) ...
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stockQuantity: number;
  shortDescription: string;
  longDescription: string;
  primaryPhotoUrl: string | null;
  category: {
    id: string;
    name: string;
  };
};
const fetchProductBySlug = async (slug: string): Promise<Product | undefined> => {
  const { data: products } = await api.get<Product[]>('/products');
  const product = products.find(p => p.slug === slug);
  return product;
};

export default function ProductDetailPage() {
  const params = useParams(); 
  const slug = params.slug as string; 
  const router = useRouter(); 
  const [quantity, setQuantity] = useState(1); 
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // --- HATA ÇÖZÜMÜ BURADA BAŞLIYOR ---
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // 1. Sepet hafızasından SADECE 'items' listesini de çek
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const isCartLoading = useCartStore((state) => state.isLoading);
  
  // --- ÇÖZÜM BİTTİ ---

  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ['product', slug], 
    queryFn: () => fetchProductBySlug(slug),
    enabled: !!slug, 
  });

  const handleAddToCart = async () => {
    setError(null);
    setSuccess(null);

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!product) return; 

    // --- HATA ÇÖZÜMÜ BURADA (AKILLI KONTROL) ---
    
    // 1. Bu ürün sepette zaten var mı?
    const itemInCart = cartItems.find(
      (item) => item.product.id === product.id
    );
    const quantityInCart = itemInCart ? itemInCart.quantity : 0;
    
    // 2. Kullanıcının istediği TOPLAM miktar (sepetteki + yeni eklenen)
    const totalRequestedQuantity = quantityInCart + quantity;

    // 3. Toplam miktar, toplam stoğu aşıyor mu?
    if (totalRequestedQuantity > product.stockQuantity) {
      const availableToAdd = product.stockQuantity - quantityInCart;
      const message = availableToAdd > 0
        ? `Stokta yeterli ürün yok. Sepetinize en fazla ${availableToAdd} adet daha ekleyebilirsiniz.`
        : `Stokta yeterli ürün yok. Bu ürünün tamamı (${product.stockQuantity} adet) zaten sepetinizde.`;
      
      setError(message); // Akıllı hata mesajını göster
      return; // İşlemi durdur
    }
    // --- AKILLI KONTROL BİTTİ ---

    try {
      // Frontend kontrolünden geçti, şimdi backend'e yolla
      await addItem(product.id, quantity);
      setSuccess("Ürün başarıyla sepete eklendi!");
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    }
  };

  // ... (Geri kalan kodun tamamı aynı: if (isLoading)... return (...) ...)
  if (isProductLoading) {
    return <div className="container mx-auto p-4 text-yellow-400">Ürün Yükleniyor...</div>;
  }
  
  if (!product) {
    return <div className="container mx-auto p-4 text-red-500">Ürün bulunamadı.</div>;
  }

  return (
    <main className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img 
            src={product.primaryPhotoUrl || 'https://via.placeholder.com/400'} 
            alt={product.name}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
        <div>
          <span className="text-sm font-semibold text-blue-400">{product.category.name}</span>
          <h1 className="mt-1 text-4xl font-bold">{product.name}</h1>
          <p className="mt-4 text-lg text-gray-300">{product.shortDescription}</p>
          <div className="my-6">
            <span className="text-4xl font-bold text-green-500">{product.price} TL</span>
          </div>
          <div className="mt-6">
            {product.stockQuantity > 0 ? (
              <span className="text-green-400">Stokta Var ({product.stockQuantity} adet)</span>
            ) : (
              <span className="text-red-500">Stok Tükendi</span>
            )}
          </div>
          <div className="mt-6">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">
              Miktar
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              max={product.stockQuantity} // Bu da bir kontrol ama asıl kontrol butonda
              disabled={product.stockQuantity === 0}
              className="mt-1 w-24 rounded-md border-gray-700 bg-gray-800 p-2 text-white disabled:opacity-50"
            />
          </div>
          <div className="mt-6">
            <button 
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0 || isCartLoading || quantity < 1} 
              className="w-full rounded-lg bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCartLoading ? 'Sepete Ekleniyor...' : 'Sepete Ekle'}
            </button>
          </div>
          {error && (
            <div className="mt-4 rounded-md bg-red-800 p-3 text-center text-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-md bg-green-800 p-3 text-center text-green-100">
              {success}
            </div>
          )}
          <div className="mt-8">
            <h3 className="text-xl font-semibold">Ürün Açıklaması</h3>
            <p className="mt-2 text-gray-400">{product.longDescription}</p>
          </div>
        </div>
      </div>
    </main>
  );
}