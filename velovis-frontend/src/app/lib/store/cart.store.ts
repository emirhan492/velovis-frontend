import { create } from 'zustand';
import  api  from '../api'; // Bizim "akıllı" (auth-aware) API istemcimiz
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
    stockQuantity: number;
  };
};

type CartState = {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;

  // Eylemler
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number, size: string) => Promise<void>;
  
  // Sepetten bir ürünü siler
  removeItem: (cartItemId: string) => Promise<void>;
  // Sepetteki bir ürünün miktarını günceller
  updateQuantity: (cartItemId: string, newQuantity: number) => Promise<void>;
  // Sadece frontend'deki sepeti temizler (Çıkış yapınca kullanılır)
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
      set({ isLoading: false, error: "Sepet yüklenemedi." });
    }
  },

  // =================================================================
  // SEPETE EKLE (addItem)
  // =================================================================
  addItem: async (productId: string, quantity: number, size: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data: updatedOrNewItem } = await api.post<CartItem>(
        '/cart-items',
        { productId, quantity, size }
      );
      
      const currentItems = get().items;
      const existingItemIndex = currentItems.findIndex(
        (item) => item.product.id === productId
      );

      if (existingItemIndex > -1) {
        const newItems = [...currentItems];
        newItems[existingItemIndex] = updatedOrNewItem;
        set({ items: newItems, isLoading: false });
      } else {
        set({ items: [...currentItems, updatedOrNewItem], isLoading: false });
      }
      
    } catch (err: any) {
      console.error("Sepete eklenirken hata:", err);
      const message = err.response?.data?.message || "Ürün sepete eklenemedi.";
      set({ isLoading: false, error: message });
      throw new Error(message); 
    }
  },

  // =================================================================
  // SEPETTEN SİL (removeItem) - YENİ
  // =================================================================
  removeItem: async (cartItemId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Backend'e DELETE isteği at
      await api.delete(`/cart-items/${cartItemId}`);

      // Başarılı olursa, frontend'deki 'items' listesinden bu ürünü çıkar
      const currentItems = get().items;
      const newItems = currentItems.filter((item) => item.id !== cartItemId);
      
      set({ items: newItems, isLoading: false });
    } catch (err: any) {
      console.error("Ürün sepetten silinirken hata:", err);
      const message = err.response?.data?.message || "Ürün sepetten silinemedi.";
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  // =================================================================
  // MİKTAR GÜNCELLE (updateItemQuantity) - YENİ
  // =================================================================
  updateItemQuantity: async (cartItemId: string, newQuantity: number) => {
    set({ isLoading: true, error: null });
    try {
      // Backend'e PATCH isteği at
      const { data: updatedItem } = await api.patch<CartItem>(
        `/cart-items/${cartItemId}`,
        { quantity: newQuantity }
      );

      // Başarılı olursa, frontend'deki 'items' listesini güncelle
      const currentItems = get().items;
      const newItems = currentItems.map((item) => 
        item.id === cartItemId ? updatedItem : item
      );
      
      set({ items: newItems, isLoading: false });
    } catch (err: any) {
      console.error("Sepet miktarı güncellenirken hata:", err);
      const message = err.response?.data?.message || "Miktar güncellenemedi.";
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },
  
  // =================================================================
  // Sadece Frontend Sepetini Temizle (clearClientCart) - YENİ
  // =================================================================
  clearClientCart: () => {
    set({ items: [], error: null });
  }

}));

// =================================================================
// AUTH STORE İLE BAĞLANTI (GÜNCELLENDİ)
// =================================================================
useAuthStore.subscribe((state, prevState) => {
  // 1. Giriş yapıldıysa -> Sepeti Yükle
  if (state.isAuthenticated && !prevState.isAuthenticated) {
    useCartStore.getState().fetchCart();
  }
  
  // 2. Çıkış yapıldıysa -> Sepeti Temizle (Frontend)
  if (!state.isAuthenticated && prevState.isAuthenticated) {
    useCartStore.getState().clearClientCart();
  }
});
