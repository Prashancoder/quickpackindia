import { Request, Response } from "express";
import { Product } from "../models/Product";
import { ProductVariant } from "../models/ProductVariant";
import { Category } from "../models/Category";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { Blog } from "../models/Blog";
import { Coupon } from "../models/Coupon";
import { Review } from "../models/Review";
import { ProductEnquiry } from "../models/ProductEnquiry";
import { normalizeSpecs } from "./productController";

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      totalBlogs,
      salesResult,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: "USER" }),
      Product.countDocuments(),
      Blog.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(8).lean(),
    ]);

    const totalSales = salesResult.length > 0 ? salesResult[0].totalSales : 0;

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalSales: Math.round(totalSales * 100) / 100,
        totalUsers,
        totalProducts,
        totalBlogs,
      },
      recentOrders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch admin stats." });
  }
}

/* ==================== PRODUCT CRUD ==================== */

export async function adminGetProducts(req: Request, res: Response): Promise<void> {
  try {
    const { search, category, page = "1", limit = "50" } = req.query;
    const filter: any = {};

    if (category && category !== "all") {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search.toString(), $options: "i" } },
        { sku: { $regex: search.toString(), $options: "i" } },
        { slug: { $regex: search.toString(), $options: "i" } },
        { subcategory: { $regex: search.toString(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort({ homepageOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const formattedProducts = products.map((p: any) => ({
      ...p,
      specifications: normalizeSpecs(p.specifications),
    }));

    res.json({ success: true, products: formattedProducts, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch admin products." });
  }
}

export async function adminCreateProduct(req: Request, res: Response): Promise<void> {
  try {
    const {
      name,
      slug,
      sku,
      shortDescription,
      description,
      category,
      subcategory,
      images = [],
      thumbnail,
      approximatePrice,
      priceUnit = "Piece",
      minimumOrderQuantity,
      manufacturingTime,
      additionalInformation,
      basePrice = 0,
      compareAtPrice,
      minPrice,
      maxPrice,
      stock = 1000,
      isActive = true,
      isFeatured = false,
      showOnHomepage = false,
      homepageOrder = 0,
      tags = [],
      specifications = [],
      seo = {},
      variants = [],
    } = req.body;

    if (!name || !description) {
      res.status(400).json({ success: false, message: "Product Name and Description are required." });
      return;
    }

    let computedSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if slug exists; if so, make unique
    const existing = await Product.findOne({ slug: computedSlug });
    if (existing) {
      computedSlug = `${computedSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const computedSku =
      sku || `QP-${computedSlug.substring(0, 8).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    // Resolve category if needed
    let assignedCategory = category;
    if (!assignedCategory) {
      const defaultCat = await Category.findOne();
      if (defaultCat) assignedCategory = defaultCat._id;
    }

    // Format images
    let formattedImages = Array.isArray(images) ? [...images] : [];
    const mainThumb = thumbnail || (formattedImages[0]?.url || "");
    if (formattedImages.length === 0 && mainThumb) {
      formattedImages = [{ url: mainThumb, alt: name, isPrimary: true }];
    }

    const product = await Product.create({
      name: name.trim(),
      slug: computedSlug,
      sku: computedSku,
      shortDescription: shortDescription || "",
      description,
      category: assignedCategory || undefined,
      subcategory: subcategory || "",
      images: formattedImages.slice(0, 10),
      thumbnail: mainThumb,
      approximatePrice: approximatePrice ? String(approximatePrice).trim() : "",
      priceUnit: priceUnit || "Piece",
      minimumOrderQuantity: minimumOrderQuantity ? String(minimumOrderQuantity).trim() : "",
      manufacturingTime: manufacturingTime ? String(manufacturingTime).trim() : "",
      additionalInformation: additionalInformation ? String(additionalInformation).trim() : "",
      basePrice: Number(basePrice) || 0,
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      minPrice: Number(minPrice ?? basePrice ?? 0),
      maxPrice: Number(maxPrice ?? basePrice ?? 0),
      stock: Number(stock) || 1000,
      isActive: Boolean(isActive),
      isFeatured: Boolean(isFeatured),
      showOnHomepage: Boolean(showOnHomepage),
      homepageOrder: Number(homepageOrder) || 0,
      tags: Array.isArray(tags) ? tags : [],
      specifications: normalizeSpecs(specifications),
      seo: {
        metaTitle: seo?.metaTitle || `${name} | QuickPack India`,
        metaDescription: seo?.metaDescription || shortDescription || description.slice(0, 150),
        focusKeyword: seo?.focusKeyword || name,
        canonicalUrl: seo?.canonicalUrl || `/products/${computedSlug}`,
      },
    });

    // Create variants if provided
    if (variants && Array.isArray(variants) && variants.length > 0) {
      const variantDocs = variants.map((v: any, index: number) => ({
        productId: product._id,
        sku: v.sku || `${computedSku}-V${index + 1}`,
        options: v.options || {},
        price: Number(v.price || basePrice || 0),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
        unitPricePerBox: v.unitPricePerBox ? Number(v.unitPricePerBox) : undefined,
        stock: Number(v.stock || stock || 1000),
        isActive: v.isActive !== false,
      }));
      await ProductVariant.insertMany(variantDocs);
    }

    res.status(201).json({ success: true, message: "Product created successfully.", product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create product." });
  }
}

export async function adminUpdateProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { variants, specifications, images, ...updateData } = req.body;

    // Check slug uniqueness if slug is being updated
    if (updateData.slug) {
      const slugExists = await Product.findOne({ slug: updateData.slug, _id: { $ne: id } });
      if (slugExists) {
        res.status(400).json({ success: false, message: "A product with this URL slug already exists. Please choose a unique slug." });
        return;
      }
    }

    if (specifications !== undefined) {
      updateData.specifications = normalizeSpecs(specifications);
    }

    if (images !== undefined) {
      updateData.images = Array.isArray(images) ? images.slice(0, 10) : [];
      if (!updateData.thumbnail && updateData.images.length > 0) {
        updateData.thumbnail = updateData.images[0].url;
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }

    // Update variants if passed
    if (variants && Array.isArray(variants)) {
      await ProductVariant.deleteMany({ productId: product._id });
      if (variants.length > 0) {
        const variantDocs = variants.map((v: any, index: number) => ({
          productId: product._id,
          sku: v.sku || `${product.sku}-V${index + 1}`,
          options: v.options || {},
          price: Number(v.price),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
          unitPricePerBox: v.unitPricePerBox ? Number(v.unitPricePerBox) : undefined,
          stock: Number(v.stock || 500),
          isActive: v.isActive !== false,
        }));
        await ProductVariant.insertMany(variantDocs);
      }
    }

    res.json({ success: true, message: "Product updated successfully.", product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update product." });
  }
}

export async function adminDeleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await Promise.all([
      Product.findByIdAndDelete(id),
      ProductVariant.deleteMany({ productId: id }),
    ]);
    res.json({ success: true, message: "Product deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete product." });
  }
}

/* ==================== CATEGORIES CRUD ==================== */

export async function adminGetCategories(req: Request, res: Response): Promise<void> {
  try {
    const categories = await Category.find().sort({ order: 1, createdAt: -1 }).lean();
    res.json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch categories." });
  }
}

export async function adminCreateCategory(req: Request, res: Response): Promise<void> {
  try {
    const { name, slug, description, image, seoTitle, seoDescription, focusKeyword, canonicalUrl, isActive } =
      req.body;

    const computedSlug =
      slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const category = await Category.create({
      name,
      slug: computedSlug,
      description,
      image,
      seoTitle,
      seoDescription,
      focusKeyword,
      canonicalUrl,
      isActive: isActive !== false,
    });

    res.status(201).json({ success: true, message: "Category created.", category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create category." });
  }
}

export async function adminUpdateCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, message: "Category updated.", category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update category." });
  }
}

export async function adminDeleteCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.json({ success: true, message: "Category deleted." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete category." });
  }
}

/* ==================== ORDERS ADMIN ==================== */

export async function adminGetOrders(req: Request, res: Response): Promise<void> {
  try {
    const { orderStatus, paymentStatus, search, page = "1", limit = "30" } = req.query;
    const filter: any = {};

    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search.toString(), $options: "i" } },
        { "shippingAddress.fullName": { $regex: search.toString(), $options: "i" } },
        { "shippingAddress.phone": { $regex: search.toString(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("userId", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, orders, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch admin orders." });
  }
}

export async function adminUpdateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus, trackingNumber, trackingUrl } = req.body;

    const update: any = {};
    if (orderStatus) update.orderStatus = orderStatus;
    if (paymentStatus) update.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) update.trackingUrl = trackingUrl;

    const order = await Order.findByIdAndUpdate(id, update, { new: true });
    res.json({ success: true, message: "Order updated successfully.", order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update order." });
  }
}

/* ==================== BLOGS ADMIN ==================== */

export async function adminGetBlogs(req: Request, res: Response): Promise<void> {
  try {
    const blogs = await Blog.find()
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, blogs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch blogs." });
  }
}

export async function adminCreateBlog(req: Request, res: Response): Promise<void> {
  try {
    const { title, slug, excerpt, content, featuredImage, author, category, tags, status, seo, relatedProducts } =
      req.body;

    const computedSlug =
      slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // Calculate reading time (approx 200 words/min)
    const wordCount = content ? content.replace(/<[^>]*>/g, "").split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const blog = await Blog.create({
      title,
      slug: computedSlug,
      excerpt,
      content,
      featuredImage,
      author: author || "QuickPack Editorial Team",
      category,
      tags: tags || [],
      status: status || "DRAFT",
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      readingTime,
      seo: seo || {},
      relatedProducts: relatedProducts || [],
    });

    res.status(201).json({ success: true, message: "Blog article created.", blog });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create blog." });
  }
}

export async function adminUpdateBlog(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.content) {
      const wordCount = updateData.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
      updateData.readingTime = Math.max(1, Math.ceil(wordCount / 200));
    }

    if (updateData.status === "PUBLISHED" && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true, message: "Blog article updated.", blog });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update blog." });
  }
}

export async function adminDeleteBlog(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);
    res.json({ success: true, message: "Blog article deleted." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete blog." });
  }
}

/* ==================== COUPONS ADMIN ==================== */

export async function adminGetCoupons(req: Request, res: Response): Promise<void> {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch coupons." });
  }
}

export async function adminCreateCoupon(req: Request, res: Response): Promise<void> {
  try {
    const { code, discountType, discountValue, minimumOrder, maximumDiscount, expiryDate, usageLimit, isActive } =
      req.body;

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minimumOrder: Number(minimumOrder || 0),
      maximumDiscount: maximumDiscount ? Number(maximumDiscount) : undefined,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      usageLimit: Number(usageLimit || 1000),
      isActive: isActive !== false,
    });

    res.status(201).json({ success: true, message: "Coupon created.", coupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create coupon." });
  }
}

export async function adminUpdateCoupon(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, message: "Coupon updated.", coupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update coupon." });
  }
}

export async function adminDeleteCoupon(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    res.json({ success: true, message: "Coupon deleted." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete coupon." });
  }
}

/* ==================== REVIEWS ADMIN ==================== */

export async function adminGetReviews(req: Request, res: Response): Promise<void> {
  try {
    const reviews = await Review.find()
      .populate("productId", "name slug thumbnail")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch reviews." });
  }
}

export async function adminUpdateReviewStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body; // "APPROVED" | "REJECTED" | "PENDING"

    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ success: true, message: `Review status updated to ${status}.`, review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update review status." });
  }
}

/* ==================== PRODUCT ENQUIRIES ADMIN ==================== */

export async function adminGetProductEnquiries(req: Request, res: Response): Promise<void> {
  try {
    const { search, status, enquiryType, page = "1", limit = "50" } = req.query;
    const filter: any = {};

    if (status && status !== "ALL") {
      filter.status = status;
    }
    if (enquiryType && enquiryType !== "ALL") {
      filter.enquiryType = enquiryType;
    }
    if (search) {
      filter.$or = [
        { customerName: { $regex: search.toString(), $options: "i" } },
        { productName: { $regex: search.toString(), $options: "i" } },
        { mobileNumber: { $regex: search.toString(), $options: "i" } },
        { email: { $regex: search.toString(), $options: "i" } },
        { companyName: { $regex: search.toString(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, parseInt(limit as string, 10));
    const skip = (pageNum - 1) * limitNum;

    const [enquiries, total] = await Promise.all([
      ProductEnquiry.find(filter)
        .populate("productId", "name slug thumbnail")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ProductEnquiry.countDocuments(filter),
    ]);

    res.json({
      success: true,
      enquiries,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch enquiries." });
  }
}

export async function adminUpdateProductEnquiryStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateFields: any = {};
    if (status) updateFields.status = status;
    if (notes !== undefined) updateFields.notes = notes;

    const enquiry = await ProductEnquiry.findByIdAndUpdate(id, updateFields, { new: true });
    if (!enquiry) {
      res.status(404).json({ success: false, message: "Enquiry not found." });
      return;
    }

    res.json({ success: true, message: "Enquiry updated successfully.", enquiry });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update enquiry." });
  }
}

export async function adminDeleteProductEnquiry(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await ProductEnquiry.findByIdAndDelete(id);
    res.json({ success: true, message: "Enquiry deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to delete enquiry." });
  }
}
