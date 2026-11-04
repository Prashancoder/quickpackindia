import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

export interface UserAddress {
  _id?: string;
  fullName: string;
  phone: string;
  houseFlat: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "USER" | "ADMIN" | "BUSINESS";
  businessProfile?: {
    companyName?: string;
    gstin?: string;
    pan?: string;
    contactPerson?: string;
    creditLimit?: number;
    isVerified?: boolean;
  };
  addresses: UserAddress[];
  wishlist?: string[];
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  setUser: (user: AuthUser | null) => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  addAddress: (address: Omit<UserAddress, "_id">) => Promise<void>;
  updateAddress: (addressId: string, address: Partial<UserAddress>) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      loginModalOpen: false,

      openLoginModal: () => set({ loginModalOpen: true }),
      closeLoginModal: () => set({ loginModalOpen: false }),

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const res = await api.login(credentials);
          set({ user: res.user, isAuthenticated: true, loginModalOpen: false });
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (data) => {
        set({ isLoading: true });
        try {
          const res = await api.signup(data);
          set({ user: res.user, isAuthenticated: true, loginModalOpen: false });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await api.logout();
        } catch {
          // ignore
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },

      fetchMe: async () => {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            set({ user: res.user, isAuthenticated: true });
          }
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      addAddress: async (address) => {
        const res = await api.addAddress(address);
        if (res.success && res.addresses) {
          const current = get().user;
          if (current) {
            set({ user: { ...current, addresses: res.addresses } });
          }
        }
      },

      updateAddress: async (addressId, address) => {
        const res = await api.updateAddress(addressId, address);
        if (res.success && res.addresses) {
          const current = get().user;
          if (current) {
            set({ user: { ...current, addresses: res.addresses } });
          }
        }
      },

      deleteAddress: async (addressId) => {
        const res = await api.deleteAddress(addressId);
        if (res.success && res.addresses) {
          const current = get().user;
          if (current) {
            set({ user: { ...current, addresses: res.addresses } });
          }
        }
      },
    }),
    {
      name: "quickpack-auth-storage",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
