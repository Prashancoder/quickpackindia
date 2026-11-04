import { Router } from "express";
import { addReview, getProductReviews } from "../controllers/reviewController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, addReview);
router.get("/product/:productId", getProductReviews);

export default router;
