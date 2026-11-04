import { Router } from "express";
import { getWishlist, toggleWishlist } from "../controllers/wishlistController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, getWishlist);
router.post("/toggle", requireAuth, toggleWishlist);

export default router;
