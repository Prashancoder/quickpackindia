import { Request, Response } from "express";
import { Blog } from "../models/Blog";
import { Category } from "../models/Category";

export async function getBlogs(req: Request, res: Response): Promise<void> {
  try {
    const { category, search, tag, page = "1", limit = "12" } = req.query;

    const filter: any = { status: "PUBLISHED" };

    if (category && category !== "all") {
      const catDoc = await Category.findOne({
        $or: [{ slug: category }, { _id: category.toString().match(/^[0-9a-fA-F]{24}$/) ? category : null }],
      });
      if (catDoc) filter.category = catDoc._id;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      const q = search.toString().trim();
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [blogs, totalCount] = await Promise.all([
      Blog.find(filter)
        .populate("category", "name slug")
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      blogs,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch blogs." });
  }
}

export async function getBlogBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: "PUBLISHED" })
      .populate("category", "name slug")
      .populate("relatedProducts", "name slug thumbnail minPrice basePrice")
      .lean();

    if (!blog) {
      res.status(404).json({ success: false, message: "Blog article not found." });
      return;
    }

    // Fetch related blogs in the same category
    const relatedBlogs = await Blog.find({
      category: blog.category,
      _id: { $ne: blog._id },
      status: "PUBLISHED",
    })
      .limit(3)
      .lean();

    res.json({
      success: true,
      blog,
      relatedBlogs,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch blog article." });
  }
}
