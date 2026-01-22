import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // LocalStorage için gerekli
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
  };
};

type CartState = {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;


  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity: number, size: string) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, newQuantity: number) => Promise<void>;
  clearClientCart: () => void;
};

const fetchProductDetails = async (productId: string) => {
    try {
        const { data } = await api.get(`/products/${productId}`);
        return {
            id: data.id,
            name: data.name,
            price: data.price,
            primaryPhotoUrl: data.primaryPhotoUrl
        };
    } catch (error) {
        console.error("Ürün detayı alınamadı", error);
        return null;
    }
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      // =================================================================
      // SEPETİ ÇEK 
      // =================================================================
      fetchCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();

        if (!isAuthenticated) return;

        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get<CartItem[]>('/cart-items');
          set({ items: data, isLoading: false });
        } catch (err: any) {
          console.error("Sepet çekilirken hata:", err);
          if (err.response?.status !== 401) {
            set({ isLoading: false, error: "Sepet yüklenemedi." });
          } else {
            set({ isLoading: false });
          }
        }
      },

      // =================================================================
      // SEPETE EKLE
      // =================================================================
      addItem: async (productId: string, quantity: number, size: string) => {
        const { isAuthenticated } = useAuthStore.getState();
        set({ isLoading: true, error: null });

        // KULLANICI İSE
        if (isAuthenticated) {
          try {
            const { data: updatedOrNewItem } = await api.post<CartItem>(
              '/cart-items',
              { productId, quantity, size }
            );

            const currentItems = get().items;
            const existingItemIndex = currentItems.findIndex(
              (item) => item.product.id === productId && item.size === size
            );

            if (existingItemIndex > -1) {
              const newItems = [...currentItems];
              newItems[existingItemIndex] = updatedOrNewItem;
              set({ items: newItems, isLoading: false });
            } else {
              set({ items: [updatedOrNewItem, ...currentItems], isLoading: false });
            }
          } catch (err: any) {
            const message = err.response?.data?.message || "Ürün sepete eklenemedi.";
            set({ isLoading: false, error: message });
            throw new Error(message);
          }
        } 
        
        // MİSAFİR
        else {
          try {
             const currentItems = get().items;
             
             const existingItemIndex = currentItems.findIndex(
                (item) => item.product.id === productId && item.size === size
             );

             if (existingItemIndex > -1) {
                 const newItems = [...currentItems];
                 newItems[existingItemIndex].quantity += quantity;
                 set({ items: newItems, isLoading: false });
             } else {
                 const productDetails = await fetchProductDetails(productId);
                 if(!productDetails) throw new Error("Ürün bilgileri alınamadı");

                 const newItem: CartItem = {
                     id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                     quantity: quantity,
                     size: size,
                     product: productDetails
                 };
                 
                 set({ items: [newItem, ...currentItems], isLoading: false });
             }

          } catch (error: any) {
             console.error("Misafir sepet hatası:", error);
             set({ isLoading: false, error: "Sepete eklenemedi" });
             throw error;
          }
        }
      },

      // =================================================================
      // SEPETTEN SİL
      // =================================================================
      removeItem: async (cartItemId: string) => {
        const { isAuthenticated } = useAuthStore.getState();
        set({ isLoading: true, error: null });

        // KULLANICI
        if (isAuthenticated) {
            try {
                await api.delete(`/cart-items/${cartItemId}`);
                const newItems = get().items.filter((item) => item.id !== cartItemId);
                set({ items: newItems, isLoading: false });
            } catch (err: any) {
                const message = err.response?.data?.message || "Silinemedi.";
                set({ isLoading: false, error: message });
                throw new Error(message);
            }
        } 
        // MİSAFİR
        else {
            const newItems = get().items.filter((item) => item.id !== cartItemId);
            set({ items: newItems, isLoading: false });
        }
      },

      // =================================================================
      // MİKTAR GÜNCELLE
      // =================================================================
      updateQuantity: async (cartItemId: string, newQuantity: number) => {
        const { isAuthenticated } = useAuthStore.getState();
        const currentItems = get().items;
        const originalItem = currentItems.find(i => i.id === cartItemId);
        if (!originalItem) return;

        const optimisticItems = currentItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        );
        set({ items: optimisticItems });

        // KULLANICI
        if (isAuthenticated) {
            try {
                const { data: updatedItem } = await api.patch<CartItem>(
                    `/cart-items/${cartItemId}`,
                    { quantity: newQuantity }
                );
                const finalItems = get().items.map((item) =>
                    item.id === cartItemId ? updatedItem : item
                );
                set({ items: finalItems });
            } catch (err: any) {
                const revertedItems = get().items.map((item) =>
                    item.id === cartItemId ? originalItem : item
                );
                set({ items: revertedItems });
                throw new Error("Miktar güncellenemedi.");
            }
        }
        // MİSAFİR
        else {

        }
      },

      clearClientCart: () => {
        set({ items: [], error: null });
      },
    }),
    {
      name: 'cart-storage', 
      storage: createJSONStorage(() => localStorage), 
      
     
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Auth Store Bağlantısı
useAuthStore.subscribe((state, prevState) => {
 
  if (state.isAuthenticated && !prevState.isAuthenticated) {
    useCartStore.getState().fetchCart();
  }

  if (!state.isAuthenticated && prevState.isAuthenticated) {
    useCartStore.getState().clearClientCart();
  }
});