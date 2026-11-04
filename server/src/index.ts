import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { errorHandler } from "./middleware/errorHandler";
import { runSeedIfEmpty } from "./seed/seedData";

// Route imports
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import cartRoutes from "./routes/cartRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import orderRoutes from "./routes/orderRoutes";
import pincodeRoutes from "./routes/pincodeRoutes";
import couponRoutes from "./routes/couponRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import blogRoutes from "./routes/blogRoutes";
import adminRoutes from "./routes/adminRoutes";
import seoRoutes from "./routes/seoRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import b2bRoutes from "./routes/b2bRoutes";
import quoteRoutes from "./routes/quoteRoutes";
import { Product } from "./models/Product";
import { Category } from "./models/Category";
import { Blog } from "./models/Blog";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost, dev ports, or same origin
      if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "QuickPack India API",
  });
});

// Dynamic XML Sitemap
app.get("/sitemap.xml", async (req, res) => {
  try {
    const siteUrl = process.env.VITE_SITE_URL || "http://localhost:3000";
    const [products, categories, blogs] = await Promise.all([
      Product.find({ isActive: true, "seo.noIndex": { $ne: true } }, "slug updatedAt").lean(),
      Category.find({ isActive: true }, "slug updatedAt").lean(),
      Blog.find({ status: "PUBLISHED", "seo.noIndex": { $ne: true } }, "slug updatedAt").lean(),
    ]);

    const staticUrls = [
      { loc: `${siteUrl}/`, changefreq: "daily", priority: "1.0" },
      { loc: `${siteUrl}/products`, changefreq: "daily", priority: "0.9" },
      { loc: `${siteUrl}/about`, changefreq: "monthly", priority: "0.8" },
      { loc: `${siteUrl}/contact`, changefreq: "monthly", priority: "0.8" },
      { loc: `${siteUrl}/blog`, changefreq: "weekly", priority: "0.8" },
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of staticUrls) {
      xml += `  <url>\n    <loc>${page.loc}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
    }

    for (const cat of categories) {
      const lastmod = cat.updatedAt ? new Date(cat.updatedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
      xml += `  <url>\n    <loc>${siteUrl}/products?category=${cat.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
    }

    for (const prod of products) {
      const lastmod = prod.updatedAt ? new Date(prod.updatedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
      xml += `  <url>\n    <loc>${siteUrl}/products/${prod.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    }

    for (const blog of blogs) {
      const lastmod = blog.updatedAt ? new Date(blog.updatedAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
      xml += `  <url>\n    <loc>${siteUrl}/blog/${blog.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    res.status(500).send("Error generating sitemap");
  }
});

// Static file serving for uploads and assets
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));
app.use("/assets", express.static(path.join(process.cwd(), "public", "assets")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/pincode", pincodeRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seo", seoRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/business", b2bRoutes);
app.use("/api/quotes", quoteRoutes);

// Centralized Error Handling
app.use(errorHandler);

// Start Server
export async function startServer() {
  await connectDB();
  await runSeedIfEmpty();

  const server = app.listen(PORT, () => {
    console.log(`[QuickPack Server] REST API running at http://localhost:${PORT}`);
  });

  return { app, server };
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

export default app;
