import { Request, Response } from "express";
import { Product } from "../models/Product";
import { ProductVariant } from "../models/ProductVariant";
import { Category } from "../models/Category";
import { Review } from "../models/Review";
import { ProductEnquiry } from "../models/ProductEnquiry";

export function normalizeSpecs(specs: any): Array<{ label: string; value: string }> {
  if (!specs) return [];
  if (Array.isArray(specs)) {
    return specs
      .filter((s) => s && (s.label || s.value))
      .map((s) => ({
        label: String(s.label || "").trim(),
        value: String(s.value || "").trim(),
      }))
      .filter((s) => s.label.length > 0 && s.value.length > 0);
  }
  if (typeof specs === "object") {
    const entries = specs instanceof Map ? Array.from(specs.entries()) : Object.entries(specs);
    return entries
      .map(([label, value]) => ({
        label: String(label).trim(),
        value: String(value).trim(),
      }))
      .filter((s) => s.label.length > 0 && s.value.length > 0);
  }
  return [];
}

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const {
      category,
      tag,
      search,
      sort = "featured",
      minPrice,
      maxPrice,
      page = "1",
      limit = "20",
      homepage,
    } = req.query;

    const filter: any = { isActive: true };

    if (homepage === "true" || homepage === "1") {
      // Prioritize products marked for homepage
      filter.showOnHomepage = true;
    }

    if (category && category !== "all") {
      const catDoc = await Category.findOne({
        $or: [{ slug: category }, { _id: category.toString().match(/^[0-9a-fA-F]{24}$/) ? category : null }],
      });
      if (catDoc) {
        filter.category = catDoc._id;
      }
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      const q = search.toString().trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { shortDescription: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
        { sku: { $regex: q, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    let sortOption: any = { homepageOrder: 1, isFeatured: -1, createdAt: -1 };
    if (sort === "price-asc") sortOption = { minPrice: 1, basePrice: 1 };
    else if (sort === "price-desc") sortOption = { minPrice: -1, basePrice: -1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };
    else if (sort === "popular") sortOption = { reviewCount: -1, rating: -1 };
    else if (sort === "homepage") sortOption = { homepageOrder: 1, isFeatured: -1, createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    let [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // If homepage was requested and fewer products were returned, supplement with active products up to limit
    if ((homepage === "true" || homepage === "1") && products.length < limitNum) {
      const existingIds = products.map((p) => p._id);
      const remainingLimit = limitNum - products.length;
      const additional = await Product.find({
        isActive: true,
        _id: { $nin: existingIds },
      })
        .populate("category", "name slug")
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(remainingLimit)
        .lean();

      products = [...products, ...additional];
      totalCount = Math.max(totalCount, products.length);
    }

    // Normalize specifications on each product
    const formattedProducts = products.map((p: any) => ({
      ...p,
      specifications: normalizeSpecs(p.specifications),
    }));

    res.json({
      success: true,
      products: formattedProducts,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch products." });
  }
}

export async function getFeaturedProducts(req: Request, res: Response): Promise<void> {
  try {
    const limitNum = Math.max(1, parseInt((req.query.limit as string) || "8", 10));
    const products = await Product.find({
      isActive: true,
      $or: [{ showOnHomepage: true }, { isFeatured: true }],
    })
      .populate("category", "name slug")
      .sort({ homepageOrder: 1, isFeatured: -1, createdAt: -1 })
      .limit(limitNum)
      .lean();

    const formattedProducts = products.map((p: any) => ({
      ...p,
      specifications: normalizeSpecs(p.specifications),
    }));

    res.json({ success: true, products: formattedProducts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch featured products." });
  }
}

export async function getProductBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;

    const product: any = await Product.findOne({ slug, isActive: true })
      .populate("category", "name slug description image")
      .lean();

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found." });
      return;
    }

    // Normalize specifications
    product.specifications = normalizeSpecs(product.specifications);

    // Fetch active variants
    const variants = await ProductVariant.find({ productId: product._id, isActive: true }).lean();

    // Fetch approved reviews
    const reviews = await Review.find({ productId: product._id, status: "APPROVED" })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Fetch related products in the same category or general active products
    const relatedFilter: any = { _id: { $ne: product._id }, isActive: true };
    if (product.category?._id || product.category) {
      relatedFilter.category = product.category._id || product.category;
    }

    let relatedProducts = await Product.find(relatedFilter)
      .limit(4)
      .lean();

    if (relatedProducts.length < 4) {
      const more = await Product.find({
        _id: { $ne: product._id, $nin: relatedProducts.map((p) => p._id) },
        isActive: true,
      })
        .limit(4 - relatedProducts.length)
        .lean();
      relatedProducts = [...relatedProducts, ...more];
    }

    const formattedRelated = relatedProducts.map((p: any) => ({
      ...p,
      specifications: normalizeSpecs(p.specifications),
    }));

    res.json({
      success: true,
      product,
      variants,
      reviews,
      relatedProducts: formattedRelated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch product." });
  }
}

export async function getProductVariants(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const variants = await ProductVariant.find({ productId, isActive: true }).lean();
    res.json({ success: true, variants });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch variants." });
  }
}

export async function searchSuggestions(req: Request, res: Response): Promise<void> {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string" || q.trim().length < 2) {
      res.json({ success: true, suggestions: [], products: [], categories: [] });
      return;
    }

    const query = q.trim();
    const [products, categories] = await Promise.all([
      Product.find(
        {
          isActive: true,
          $or: [
            { name: { $regex: query, $options: "i" } },
            { tags: { $regex: query, $options: "i" } },
            { subcategory: { $regex: query, $options: "i" } },
          ],
        },
        "name slug thumbnail images approximatePrice minPrice maxPrice basePrice category"
      )
        .populate("category", "name slug")
        .limit(8)
        .lean(),
      Category.find(
        {
          isActive: true,
          name: { $regex: query, $options: "i" },
        },
        "name slug image"
      )
        .limit(4)
        .lean(),
    ]);

    res.json({
      success: true,
      products,
      categories,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Search failed." });
  }
}

export async function submitProductEnquiry(req: Request, res: Response): Promise<void> {
  try {
    const {
      productId,
      productName,
      productSlug,
      customerName,
      mobileNumber,
      email,
      companyName,
      requiredQuantity,
      message,
      enquiryType,
    } = req.body;

    if (!customerName || !mobileNumber || !email || !requiredQuantity || !productName) {
      res.status(400).json({
        success: false,
        message: "Please fill in all required fields (Name, Mobile, Email, Required Quantity).",
      });
      return;
    }

    const cleanMobile = mobileNumber.toString().replace(/[^0-9+]/g, "");
    if (cleanMobile.length < 10) {
      res.status(400).json({
        success: false,
        message: "Please enter a valid mobile number with at least 10 digits.",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
      return;
    }

    // Duplicate check within 15 seconds
    const fifteenSecondsAgo = new Date(Date.now() - 15 * 1000);
    const recentDuplicate = await ProductEnquiry.findOne({
      mobileNumber: cleanMobile,
      productName,
      createdAt: { $gte: fifteenSecondsAgo },
    });

    if (recentDuplicate) {
      res.status(429).json({
        success: false,
        message: "Your enquiry was already submitted. Our team will contact you shortly!",
      });
      return;
    }

    const enquiry = await ProductEnquiry.create({
      productId: productId || undefined,
      productName: productName.trim(),
      productSlug: productSlug?.trim() || "",
      customerName: customerName.trim(),
      mobileNumber: cleanMobile,
      email: email.trim().toLowerCase(),
      companyName: companyName?.trim() || "",
      requiredQuantity: requiredQuantity.toString().trim(),
      message: message?.trim() || "",
      enquiryType: enquiryType || "GET_QUOTE",
      status: "NEW",
    });

    res.status(201).json({
      success: true,
      message: "Thank you! Your enquiry has been received. Our packaging specialist will contact you shortly.",
      enquiryId: enquiry._id,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit enquiry. Please try again or call us.",
    });
  }
}
