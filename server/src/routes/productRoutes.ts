import { Router } from "express";
import {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProductVariants,
  searchSuggestions,
  submitProductEnquiry,
} from "../controllers/productController";

const router = Router();

router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);
router.get("/search/suggestions", searchSuggestions);
router.post("/enquiry", submitProductEnquiry);
router.get("/:slug", getProductBySlug);
router.get("/:productId/variants", getProductVariants);

export default router;
