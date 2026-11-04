import { Router } from "express";
import { calculateQuote, submitQuoteRequest } from "../controllers/quoteController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

router.post("/calculate", calculateQuote);
router.post("/", optionalAuth, submitQuoteRequest);

export default router;
