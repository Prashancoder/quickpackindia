import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { Product } from "../models/Product";

export async function getWishlist(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      match: { isActive: true },
      populate: { path: "category", select: "name slug" },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({ success: true, wishlist: user.wishlist });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch wishlist." });
  }
}

export async function toggleWishlist(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ success: false, message: "Product ID is required." });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    const index = user.wishlist.findIndex((id) => id.toString() === productId);
    let isAdded = false;

    if (index > -1) {
      user.wishlist.splice(index, 1);
      isAdded = false;
    } else {
      user.wishlist.push(productId);
      isAdded = true;
    }

    await user.save();

    res.json({
      success: true,
      message: isAdded ? "Added to wishlist." : "Removed from wishlist.",
      isAdded,
      wishlist: user.wishlist,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update wishlist." });
  }
}
