import { Router } from "express";
import { getCart, syncCart, updateCart } from "../controllers/cartController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, getCart);
router.post("/sync", requireAuth, syncCart);
router.put("/", requireAuth, updateCart);

export default router;
