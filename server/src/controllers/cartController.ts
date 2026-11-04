import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { ProductVariant } from "../models/ProductVariant";

export async function getCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const user = await User.findById(req.user._id)
      .populate("savedCart.productId")
      .populate("savedCart.variantId");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({ success: true, cart: user.savedCart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch cart." });
  }
}

export async function syncCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { items = [] } = req.body; // Guest cart items [{ productId, variantId, quantity }]
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Merge incoming guest items into existing savedCart
    for (const item of items) {
      if (!item.productId) continue;

      const existingIndex = user.savedCart.findIndex(
        (ci) =>
          ci.productId.toString() === item.productId &&
          (ci.variantId?.toString() || null) === (item.variantId || null)
      );

      if (existingIndex > -1) {
        user.savedCart[existingIndex].quantity += item.quantity || 1;
      } else {
        user.savedCart.push({
          productId: item.productId,
          variantId: item.variantId || undefined,
          quantity: item.quantity || 1,
        });
      }
    }

    await user.save();
    const updatedUser = await User.findById(user._id)
      .populate("savedCart.productId")
      .populate("savedCart.variantId");

    res.json({
      success: true,
      message: "Cart synchronized successfully.",
      cart: updatedUser?.savedCart || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to sync cart." });
  }
}

export async function updateCart(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { items = [] } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    user.savedCart = items.map((item: any) => ({
      productId: item.productId,
      variantId: item.variantId || undefined,
      quantity: item.quantity,
    }));

    await user.save();
    res.json({ success: true, message: "Cart updated.", cart: user.savedCart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update cart." });
  }
}
