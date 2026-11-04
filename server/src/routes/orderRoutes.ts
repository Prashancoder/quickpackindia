import { Router } from "express";
import {
  createCheckoutSession,
  verifyPayment,
  getOrderById,
  getMyOrders,
  cancelOrder,
  getPaymentGateways,
} from "../controllers/orderController";
import { requireAuth, optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/gateways", getPaymentGateways);
router.post("/create-checkout-session", optionalAuth, createCheckoutSession);
router.post("/verify-payment", optionalAuth, verifyPayment);
router.get("/my-orders", requireAuth, getMyOrders);
router.post("/:orderId/cancel", requireAuth, cancelOrder);
router.get("/:orderId", optionalAuth, getOrderById);

export default router;
