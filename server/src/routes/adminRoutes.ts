import { Router } from "express";
import {
  getDashboardStats,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminGetBlogs,
  adminCreateBlog,
  adminUpdateBlog,
  adminDeleteBlog,
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  adminGetReviews,
  adminUpdateReviewStatus,
  adminGetProductEnquiries,
  adminUpdateProductEnquiryStatus,
  adminDeleteProductEnquiry,
} from "../controllers/adminController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// Protect all admin routes with authentication + admin role check
router.use(requireAuth, requireAdmin);

// Dashboard
router.get("/dashboard", getDashboardStats);

// Products
router.get("/products", adminGetProducts);
router.post("/products", adminCreateProduct);
router.put("/products/:id", adminUpdateProduct);
router.delete("/products/:id", adminDeleteProduct);

// Product Enquiries (Leads from Request Callback / Quote / Interested)
router.get("/enquiries", adminGetProductEnquiries);
router.put("/enquiries/:id", adminUpdateProductEnquiryStatus);
router.patch("/enquiries/:id", adminUpdateProductEnquiryStatus);
router.delete("/enquiries/:id", adminDeleteProductEnquiry);

// Categories
router.get("/categories", adminGetCategories);
router.post("/categories", adminCreateCategory);
router.put("/categories/:id", adminUpdateCategory);
router.delete("/categories/:id", adminDeleteCategory);

// Orders
router.get("/orders", adminGetOrders);
router.put("/orders/:id", adminUpdateOrderStatus);

// Blogs
router.get("/blogs", adminGetBlogs);
router.post("/blogs", adminCreateBlog);
router.put("/blogs/:id", adminUpdateBlog);
router.delete("/blogs/:id", adminDeleteBlog);

// Coupons
router.get("/coupons", adminGetCoupons);
router.post("/coupons", adminCreateCoupon);
router.put("/coupons/:id", adminUpdateCoupon);
router.delete("/coupons/:id", adminDeleteCoupon);

// Reviews
router.get("/reviews", adminGetReviews);
router.put("/reviews/:id", adminUpdateReviewStatus);

export default router;
