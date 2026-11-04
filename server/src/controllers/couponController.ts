import { Request, Response } from "express";
import { Coupon } from "../models/Coupon";

export async function validateCoupon(req: Request, res: Response): Promise<void> {
  try {
    const { code, cartSubtotal = 0 } = req.body;

    if (!code || typeof code !== "string") {
      res.status(400).json({ success: false, message: "Please provide a coupon code." });
      return;
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      res.status(404).json({ success: false, message: "Invalid or expired coupon code." });
      return;
    }

    const now = new Date();
    if (coupon.expiryDate && coupon.expiryDate < now) {
      res.status(400).json({ success: false, message: "This coupon code has expired." });
      return;
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      res.status(400).json({ success: false, message: "Coupon usage limit reached." });
      return;
    }

    const subtotal = Number(cartSubtotal);
    if (subtotal < (coupon.minimumOrder || 0)) {
      res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minimumOrder} required for this coupon.`,
      });
      return;
    }

    let discount = 0;
    if (coupon.discountType === "PERCENT") {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, subtotal);

    res.json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discount * 100) / 100,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to validate coupon." });
  }
}
