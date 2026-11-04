import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

export interface WishlistItem {
  _id: string;
  name: string;
  slug: string;
  thumbnail: string;
  minPrice: number;
  maxPrice: number;
  basePrice: number;
  category?: { name: string; slug: string };
}

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: WishlistItem) => Promise<boolean>;
  fetchWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item._id === productId);
      },

      toggleWishlist: async (product: WishlistItem) => {
        const items = get().items;
        const exists = items.some((item) => item._id === product._id);
        let newItems: WishlistItem[];

        if (exists) {
          newItems = items.filter((item) => item._id !== product._id);
        } else {
          newItems = [...items, product];
        }

        set({ items: newItems });

        try {
          await api.toggleWishlist(product._id);
        } catch {
          // offline or guest mode
        }

        return !exists;
      },

      fetchWishlist: async () => {
        set({ isLoading: true });
        try {
          const res = await api.getWishlist();
          if (res.success && res.wishlist) {
            set({ items: res.wishlist });
          }
        } catch {
          // guest mode
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "quickpack-wishlist-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
