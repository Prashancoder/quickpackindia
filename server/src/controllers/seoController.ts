import { Request, Response } from "express";
import { SeoSettings } from "../models/SeoSettings";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { Blog } from "../models/Blog";

export async function getSeoSettings(req: Request, res: Response): Promise<void> {
  try {
    let settings = await SeoSettings.findOne();
    if (!settings) {
      settings = await SeoSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch SEO settings." });
  }
}

export async function updateSeoSettings(req: Request, res: Response): Promise<void> {
  try {
    let settings = await SeoSettings.findOne();
    if (!settings) {
      settings = await SeoSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ success: true, message: "SEO settings updated successfully.", settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update SEO settings." });
  }
}

export async function getSitemapData(req: Request, res: Response): Promise<void> {
  try {
    const [products, categories, blogs] = await Promise.all([
      Product.find({ isActive: true, "seo.noIndex": { $ne: true } }, "slug updatedAt").lean(),
      Category.find({ isActive: true }, "slug updatedAt").lean(),
      Blog.find({ status: "PUBLISHED", "seo.noIndex": { $ne: true } }, "slug updatedAt").lean(),
    ]);

    res.json({
      success: true,
      products: products.map((p) => ({ url: `/products/${p.slug}`, updatedAt: p.updatedAt })),
      categories: categories.map((c) => ({ url: `/products?category=${c.slug}`, updatedAt: c.updatedAt })),
      blogs: blogs.map((b) => ({ url: `/blog/${b.slug}`, updatedAt: b.updatedAt })),
      staticPages: [
        { url: "/", priority: 1.0, changefreq: "daily" },
        { url: "/products", priority: 0.9, changefreq: "daily" },
        { url: "/about", priority: 0.8, changefreq: "monthly" },
        { url: "/contact", priority: 0.8, changefreq: "monthly" },
        { url: "/blog", priority: 0.8, changefreq: "weekly" },
      ],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to generate sitemap data." });
  }
}
