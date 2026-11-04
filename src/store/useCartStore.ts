import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

export interface CartItem {
  id: string; // composite key: `${productId}_${variantId || 'default'}`
  productId: string;
  variantId?: string;
  productName: string;
  slug: string;
  image: string;
  variantOptions?: {
    topPaper?: string;
    packQuantity?: number;
    size?: string;
    ply?: string;
    [key: string]: any;
  };
  price: number;
  compareAtPrice?: number;
  unitPricePerBox?: number;
  quantity: number;
}

export interface AppliedCoupon {
  code: string;
  discountType: "PERCENT" | "FLAT";
  discountValue: number;
  discountAmount: number;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  appliedCoupon: AppliedCoupon | null;

  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  addItem: (item: Omit<CartItem, "id"> & { id?: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;

  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;

  // Computed Helpers
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTax: () => number;
  getGrandTotal: () => number;
  syncWithServer: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      appliedCoupon: null,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      addItem: (newItem) => {
        const itemId = newItem.id || `${newItem.productId}_${newItem.variantId || "default"}`;
        const items = get().items;
        const existingIndex = items.findIndex((i) => i.id === itemId);

        if (existingIndex > -1) {
          const updatedItems = [...items];
          updatedItems[existingIndex].quantity += newItem.quantity || 1;
          set({ items: updatedItems, isDrawerOpen: true });
        } else {
          set({
            items: [...items, { ...newItem, id: itemId }],
            isDrawerOpen: true,
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        });
      },

      clearCart: () => set({ items: [], appliedCoupon: null }),

      applyCoupon: async (code: string) => {
        const subtotal = get().getSubtotal();
        try {
          const res = await api.validateCoupon(code, subtotal);
          if (res.success && res.coupon) {
            set({ appliedCoupon: res.coupon });
            return { success: true, message: res.message || "Coupon applied!" };
          }
          return { success: false, message: res.message || "Invalid coupon" };
        } catch (error: any) {
          return { success: false, message: error.message || "Failed to apply coupon." };
        }
      },

      removeCoupon: () => set({ appliedCoupon: null }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        const sum = get().items.reduce((total, item) => total + item.price * item.quantity, 0);
        return Math.round(sum * 100) / 100;
      },

      getDiscount: () => {
        const coupon = get().appliedCoupon;
        const subtotal = get().getSubtotal();
        if (!coupon) return 0;
        if (coupon.discountType === "PERCENT") {
          return Math.min(subtotal, Math.round((subtotal * coupon.discountValue) / 100 * 100) / 100);
        }
        return Math.min(subtotal, coupon.discountValue);
      },

      getTax: () => {
        // GST 18% inclusive
        const taxable = get().getSubtotal() - get().getDiscount();
        return Math.round(((taxable * 0.18) / 1.18) * 100) / 100;
      },

      getGrandTotal: () => {
        const total = get().getSubtotal() - get().getDiscount();
        return Math.max(0, Math.round(total * 100) / 100);
      },

      syncWithServer: async () => {
        const items = get().items;
        if (items.length === 0) return;
        try {
          await api.syncCart(
            items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              quantity: i.quantity,
            }))
          );
        } catch {
          // guest mode or offline
        }
      },
    }),
    {
      name: "quickpack-cart-storage",
      partialize: (state) => ({
        items: state.items,
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
);
