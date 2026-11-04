import { Request, Response } from "express";
import { Category } from "../models/Category";
import { Product } from "../models/Product";

export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();

    // Attach product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat._id, isActive: true });
        return {
          ...cat,
          productCount,
        };
      })
    );

    res.json({ success: true, categories: categoriesWithCount });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch categories." });
  }
}

export async function getCategoryBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, isActive: true }).lean();

    if (!category) {
      res.status(404).json({ success: false, message: "Category not found." });
      return;
    }

    const products = await Product.find({ category: category._id, isActive: true }).lean();

    res.json({
      success: true,
      category,
      products,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch category." });
  }
}
