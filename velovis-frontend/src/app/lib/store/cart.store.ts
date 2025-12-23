import { create } from 'zustand';
import api from '../api'; 
import { useAuthStore } from './auth.store';

export type CartItem = {
  id: string;
  quantity: number;
  size: string | null;
  product: {
    id: string;
    name: string;
    price: number;
    primaryPhotoUrl: string | null;
    // stockQuantity artık gelmeyebilir, frontend'de zaten beden seçerken kontrol ettik
  };
};

type CartState = {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;

  // Eylemler
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number, size: string) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, newQuantity: number) => Promise<void>;
  clearClientCart: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  // =================================================================
  // SEPETİ ÇEK (fetchCart)
  // =================================================================
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<CartItem[]>('/cart-items');
      set({ items: data, isLoading: false });
    } catch (err: any) {
      console.error("Sepet çekilirken hata:", err);
      // 404 veya Auth hatası değilse hata göster
      if(err.response?.status !== 401) {
          set({ isLoading: false, error: "Sepet yüklenemedi." });
      } else {
          set({ isLoading: false });
      }
    }
  },

  // =================================================================
  // SEPETE EKLE (addItem) - GÜNCELLENDİ
  // =================================================================
  addItem: async (productId: string, quantity: number, size: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: updatedOrNewItem } = await api.post<CartItem>(
        '/cart-items',
        { productId, quantity, size }
      );
      
      const currentItems = get().items;
      
      // KRİTİK GÜNCELLEME: Sadece productId'ye değil, SIZE'a da bakmalıyız!
      // Yoksa S beden sepetteyken M beden eklersen S'nin üstüne yazar.
      const existingItemIndex = currentItems.findIndex(
        (item) => item.product.id === productId && item.size === size
      );

      if (existingItemIndex > -1) {
        // Var olanı güncelle
        const newItems = [...currentItems];
        newItems[existingItemIndex] = updatedOrNewItem;
        set({ items: newItems, isLoading: false });
      } else {
        // Yeni ekle
        set({ items: [updatedOrNewItem, ...currentItems], isLoading: false });
      }
      
    } catch (err: any) {
      console.error("Sepete eklenirken hata:", err);
      const message = err.response?.data?.message || "Ürün sepete eklenemedi.";
      set({ isLoading: false, error: message });
      throw new Error(message); 
    }
  },

  // =================================================================
  // SEPETTEN SİL (removeItem)
  // =================================================================
  removeItem: async (cartItemId: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/cart-items/${cartItemId}`);

      const currentItems = get().items;
      const newItems = currentItems.filter((item) => item.id !== cartItemId);
      
      set({ items: newItems, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || "Ürün sepetten silinemedi.";
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  // =================================================================
  // MİKTAR GÜNCELLE
  // =================================================================
  updateQuantity: async (cartItemId: string, newQuantity: number) => {
    // Optimistic Update (Hızlı hissettirmek için önce arayüzü güncelle)
    // Ama hata olursa geri alacağız.
    const currentItems = get().items;
    const originalItem = currentItems.find(i => i.id === cartItemId);
    
    if(!originalItem) return;

    // Arayüzde hemen güncelle
    const optimisticItems = currentItems.map((item) => 
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
    );
    set({ items: optimisticItems });

    try {
      const { data: updatedItem } = await api.patch<CartItem>(
        `/cart-items/${cartItemId}`,
        { quantity: newQuantity }
      );

      // Backend'den gelen kesin veriyi işle
      const finalItems = get().items.map((item) => 
        item.id === cartItemId ? updatedItem : item
      );
      set({ items: finalItems });

    } catch (err: any) {
      console.error("Sepet miktarı güncellenirken hata:", err);
      // Hata olursa eski haline döndür
      const revertedItems = get().items.map((item) => 
         item.id === cartItemId ? originalItem : item
      );
      set({ items: revertedItems });

      const message = err.response?.data?.message || "Miktar güncellenemedi.";
      // Hata mesajını store'da tutmak yerine fırlatabiliriz veya toast gösterebiliriz
      throw new Error(message);
    }
  },
  
  // =================================================================
  // Sadece Frontend Sepetini Temizle
  // =================================================================
  clearClientCart: () => {
    set({ items: [], error: null });
  }

}));

// Auth Store Bağlantısı
useAuthStore.subscribe((state, prevState) => {
  if (state.isAuthenticated && !prevState.isAuthenticated) {
    useCartStore.getState().fetchCart();
  }
  if (!state.isAuthenticated && prevState.isAuthenticated) {
    useCartStore.getState().clearClientCart();
  }
});