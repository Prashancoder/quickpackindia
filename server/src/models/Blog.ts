import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlogSeo {
  seoTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  schemaType?: string; // "Article" | "BlogPosting" | "NewsArticle"
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // Clean semantic HTML
  featuredImage: string;
  author: string;
  category: mongoose.Types.ObjectId;
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: Date;
  readingTime?: number; // In minutes
  relatedProducts: mongoose.Types.ObjectId[];
  seo: IBlogSeo;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSeoSchema = new Schema<IBlogSeo>(
  {
    seoTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    focusKeyword: { type: String, default: "" },
    canonicalUrl: { type: String, default: "" },
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    noIndex: { type: Boolean, default: false },
    schemaType: { type: String, default: "Article" },
  },
  { _id: false }
);

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    featuredImage: { type: String, default: "" },
    author: { type: String, default: "QuickPack Editorial Team" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
      index: true,
    },
    publishedAt: { type: Date },
    readingTime: { type: Number, default: 5 },
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    seo: { type: BlogSeoSchema, default: () => ({}) },
  },
  {
    timestamps: true,
  }
);

export const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
