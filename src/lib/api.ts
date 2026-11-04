/**
 * Typed API Client for QuickPack India Ecommerce Backend
 */

const API_BASE = typeof window !== "undefined" ? "/api" : (process.env.VITE_API_URL || "http://localhost:5000/api");

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Send HTTP-only auth cookies
  });

  const data = await res.json().catch(() => ({
    success: false,
    message: res.statusText || "Failed to parse response",
  }));

  if (!res.ok || data.success === false) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const err: any = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data as T;
}

export const api = {
  // Products & Categories
  getProducts: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch(`/products${query ? `?${query}` : ""}`);
  },
  getFeaturedProducts: () => apiFetch("/products/featured"),
  getProductBySlug: (slug: string) => apiFetch(`/products/${slug}`),
  searchSuggestions: (q: string) => apiFetch(`/products/search/suggestions?q=${encodeURIComponent(q)}`),
  submitProductEnquiry: (data: any) =>
    apiFetch("/products/enquiry", { method: "POST", body: JSON.stringify(data) }),
  getCategories: () => apiFetch("/categories"),
  getCategoryBySlug: (slug: string) => apiFetch(`/categories/${slug}`),

  // Pincode Delivery Check
  checkPincode: (pincode: string) => apiFetch(`/pincode/check?pincode=${encodeURIComponent(pincode)}`),

  // Coupons
  validateCoupon: (code: string, cartSubtotal: number) =>
    apiFetch("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, cartSubtotal }),
    }),

  // Auth & Password Recovery
  signup: (data: { name: string; email: string; password: string; phone?: string }) =>
    apiFetch("/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
  getMe: () => apiFetch("/auth/me"),
  updateProfile: (data: { name?: string; phone?: string }) =>
    apiFetch("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
  updateBusinessProfile: (data: { companyName?: string; gstin?: string; pan?: string; contactPerson?: string }) =>
    apiFetch("/auth/business", { method: "PUT", body: JSON.stringify(data) }),
  forgotPassword: (email: string) =>
    apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (data: { token: string; password: string }) =>
    apiFetch("/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),
  addAddress: (data: any) =>
    apiFetch("/auth/addresses", { method: "POST", body: JSON.stringify(data) }),
  updateAddress: (addressId: string, data: any) =>
    apiFetch(`/auth/addresses/${addressId}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAddress: (addressId: string) =>
    apiFetch(`/auth/addresses/${addressId}`, { method: "DELETE" }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch("/auth/change-password", { method: "PUT", body: JSON.stringify(data) }),

  // Cart & Wishlist
  getCart: () => apiFetch("/cart"),
  syncCart: (items: any[]) =>
    apiFetch("/cart/sync", { method: "POST", body: JSON.stringify({ items }) }),
  getWishlist: () => apiFetch("/wishlist"),
  toggleWishlist: (productId: string) =>
    apiFetch("/wishlist/toggle", { method: "POST", body: JSON.stringify({ productId }) }),

  // Orders & Payment
  getPaymentGateways: () => apiFetch("/orders/gateways"),
  createCheckoutSession: (payload: {
    items: any[];
    shippingAddress: any;
    billingAddress?: any;
    couponCode?: string;
    notes?: string;
    gateway?: string;
    returnUrl?: string;
  }) => apiFetch("/orders/create-checkout-session", { method: "POST", body: JSON.stringify(payload) }),
  verifyPayment: (payload: {
    orderId?: string;
    orderNumber?: string;
    gateway?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  }) => apiFetch("/orders/verify-payment", { method: "POST", body: JSON.stringify(payload) }),
  getOrderById: (orderId: string) => apiFetch(`/orders/${orderId}`),
  getMyOrders: () => apiFetch("/orders/my-orders"),
  cancelOrder: (orderId: string) => apiFetch(`/orders/${orderId}/cancel`, { method: "POST" }),

  // Packaging Custom Manufacturing Quote Calculator
  calculateQuote: (params: {
    productType?: string;
    length: number;
    width: number;
    height: number;
    unit?: "inch" | "cm" | "mm";
    boardGrade: string;
    printing?: string;
    finish?: string;
    quantity: number;
  }) => apiFetch("/quotes/calculate", { method: "POST", body: JSON.stringify(params) }),
  submitQuoteRequest: (data: any) => apiFetch("/quotes", { method: "POST", body: JSON.stringify(data) }),

  // Customer B2B Portal
  b2b: {
    getMe: () => apiFetch("/business/me"),
    getOrders: () => apiFetch("/business/orders"),
    getOrderById: (id: string) => apiFetch(`/business/orders/${id}`),
    requestReorder: (id: string, data: { quantity?: number; notes?: string }) =>
      apiFetch(`/business/orders/${id}/reorder`, { method: "POST", body: JSON.stringify(data) }),
    uploadOrderDesign: (id: string, data: { fileUrl: string; fileName: string; fileType?: string; notes?: string }) =>
      apiFetch(`/business/orders/${id}/upload-design`, { method: "POST", body: JSON.stringify(data) }),
    approveOrderDesign: (id: string, data: { version: number; notes?: string }) =>
      apiFetch(`/business/orders/${id}/approve-design`, { method: "POST", body: JSON.stringify(data) }),
    getQuotations: () => apiFetch("/business/quotations"),
    acceptQuotation: (id: string) => apiFetch(`/business/quotations/${id}/accept`, { method: "POST" }),
    rejectQuotation: (id: string, reason?: string) =>
      apiFetch(`/business/quotations/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
    getPayments: () => apiFetch("/business/payments"),
    getDocuments: () => apiFetch("/business/documents"),
  },

  // Reviews
  addReview: (data: { productId: string; rating: number; title: string; comment: string }) =>
    apiFetch("/reviews", { method: "POST", body: JSON.stringify(data) }),
  getProductReviews: (productId: string) => apiFetch(`/reviews/product/${productId}`),

  // Blogs
  getBlogs: (params?: Record<string, any>) => {
    const query = new URLSearchParams(params as any).toString();
    return apiFetch(`/blogs${query ? `?${query}` : ""}`);
  },
  getBlogBySlug: (slug: string) => apiFetch(`/blogs/${slug}`),

  // Admin
  admin: {
    getDashboardStats: () => apiFetch("/admin/dashboard"),
    getProducts: (params?: Record<string, any>) => {
      const q = new URLSearchParams(params as any).toString();
      return apiFetch(`/admin/products${q ? `?${q}` : ""}`);
    },
    createProduct: (data: any) => apiFetch("/admin/products", { method: "POST", body: JSON.stringify(data) }),
    updateProduct: (id: string, data: any) => apiFetch(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteProduct: (id: string) => apiFetch(`/admin/products/${id}`, { method: "DELETE" }),

    getEnquiries: (params?: any) => {
      const q = new URLSearchParams(params as any).toString();
      return apiFetch(`/admin/enquiries${q ? `?${q}` : ""}`);
    },
    updateEnquiryStatus: (id: string, data: any) =>
      apiFetch(`/admin/enquiries/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteEnquiry: (id: string) => apiFetch(`/admin/enquiries/${id}`, { method: "DELETE" }),

    getCategories: () => apiFetch("/admin/categories"),
    createCategory: (data: any) => apiFetch("/admin/categories", { method: "POST", body: JSON.stringify(data) }),
    updateCategory: (id: string, data: any) => apiFetch(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteCategory: (id: string) => apiFetch(`/admin/categories/${id}`, { method: "DELETE" }),

    getOrders: (params?: any) => {
      const q = new URLSearchParams(params as any).toString();
      return apiFetch(`/admin/orders${q ? `?${q}` : ""}`);
    },
    updateOrderStatus: (id: string, data: any) =>
      apiFetch(`/admin/orders/${id}`, { method: "PUT", body: JSON.stringify(data) }),

    getBlogs: () => apiFetch("/admin/blogs"),
    createBlog: (data: any) => apiFetch("/admin/blogs", { method: "POST", body: JSON.stringify(data) }),
    updateBlog: (id: string, data: any) => apiFetch(`/admin/blogs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteBlog: (id: string) => apiFetch(`/admin/blogs/${id}`, { method: "DELETE" }),

    getCoupons: () => apiFetch("/admin/coupons"),
    createCoupon: (data: any) => apiFetch("/admin/coupons", { method: "POST", body: JSON.stringify(data) }),
    updateCoupon: (id: string, data: any) => apiFetch(`/admin/coupons/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteCoupon: (id: string) => apiFetch(`/admin/coupons/${id}`, { method: "DELETE" }),

    getReviews: () => apiFetch("/admin/reviews"),
    updateReviewStatus: (id: string, status: string) =>
      apiFetch(`/admin/reviews/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),

    getSeoSettings: () => apiFetch("/seo/settings"),
    updateSeoSettings: (data: any) => apiFetch("/seo/settings", { method: "PUT", body: JSON.stringify(data) }),

    // Admin B2B & Custom Manufacturing CRM
    getB2BOrders: (params?: any) => {
      const q = new URLSearchParams(params as any).toString();
      return apiFetch(`/business/admin/orders${q ? `?${q}` : ""}`);
    },
    createCustomOrder: (data: any) =>
      apiFetch("/business/admin/orders", { method: "POST", body: JSON.stringify(data) }),
    updateCustomOrderStatus: (id: string, data: any) =>
      apiFetch(`/business/admin/orders/${id}/status`, { method: "PATCH", body: JSON.stringify(data) }),
    recordOrderPayment: (id: string, data: any) =>
      apiFetch(`/business/admin/orders/${id}/payments`, { method: "POST", body: JSON.stringify(data) }),
    attachOrderDocument: (id: string, data: any) =>
      apiFetch(`/business/admin/orders/${id}/documents`, { method: "POST", body: JSON.stringify(data) }),
    reconcilePayment: (data: { paymentId: string; verified: boolean }) =>
      apiFetch("/business/admin/payments/reconcile", { method: "POST", body: JSON.stringify(data) }),
    getQuotations: (params?: any) => {
      const q = new URLSearchParams(params as any).toString();
      return apiFetch(`/business/admin/quotations${q ? `?${q}` : ""}`);
    },
    convertQuotationToOrder: (id: string) =>
      apiFetch(`/business/admin/quotations/${id}/convert-to-order`, { method: "POST" }),
    getBusinessCustomers: () => apiFetch("/business/admin/customers"),
    getCustomerLedger: (params?: any) => {
      const q = new URLSearchParams(params as any).toString();
      return apiFetch(`/business/admin/reports/ledger${q ? `?${q}` : ""}`);
    },
  },

  // File Upload
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<{ success: boolean; url: string; filename: string; message?: string }>("/upload", {
      method: "POST",
      body: formData,
    });
  },
  uploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return apiFetch<{
      success: boolean;
      files: Array<{ url: string; filename: string; originalName: string; size: number }>;
      urls: string[];
      message?: string;
    }>("/upload/multiple", {
      method: "POST",
      body: formData,
    });
  },
};
