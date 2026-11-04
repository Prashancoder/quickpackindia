import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Review } from "../models/Review";
import { Product } from "../models/Product";
import { Order } from "../models/Order";

export async function addReview(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required to submit a review." });
      return;
    }

    const { productId, rating, title, comment } = req.body;

    if (!productId || !rating || !title || !comment) {
      res.status(400).json({ success: false, message: "Product ID, rating, title, and review comments are required." });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }

    // Check if user purchased this product
    const order = await Order.findOne({
      userId: req.user._id,
      "items.productId": product._id,
      paymentStatus: "PAID",
    });

    const isVerifiedPurchase = !!order;

    const review = await Review.create({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      productId: product._id,
      orderId: order?._id,
      rating: Number(rating),
      title: title.trim(),
      comment: comment.trim(),
      isVerifiedPurchase,
      status: "APPROVED",
    });

    // Recalculate average rating & reviewCount for product
    const stats = await Review.aggregate([
      { $match: { productId: product._id, status: "APPROVED" } },
      {
        $group: {
          _id: "$productId",
          avgRating: { $avg: "$rating" },
          totalCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      product.rating = Math.round(stats[0].avgRating * 10) / 10;
      product.reviewCount = stats[0].totalCount;
      await product.save();
    }

    res.status(201).json({
      success: true,
      message: "Thank you! Your review has been published.",
      review,
      productRating: product.rating,
      productReviewCount: product.reviewCount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to submit review." });
  }
}

export async function getProductReviews(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId, status: "APPROVED" })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch reviews." });
  }
}
