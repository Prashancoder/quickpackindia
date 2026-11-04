import { Router } from "express";
import { getSeoSettings, updateSeoSettings, getSitemapData } from "../controllers/seoController";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.get("/settings", getSeoSettings);
router.put("/settings", requireAuth, requireAdmin, updateSeoSettings);
router.get("/sitemap-data", getSitemapData);

export default router;
