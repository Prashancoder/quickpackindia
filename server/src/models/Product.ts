import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductImage {
  url: string;
  alt: string;
  caption?: string;
  isPrimary?: boolean;
}

export interface IProductSpecification {
  label: string;
  value: string;
}

export interface IProductSeo {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  category?: mongoose.Types.ObjectId;
  subcategory?: string;
  images: IProductImage[];
  thumbnail: string;
  approximatePrice?: string;
  priceUnit?: string;
  minimumOrderQuantity?: string;
  manufacturingTime?: string;
  additionalInformation?: string;
  basePrice: number;
  compareAtPrice?: number;
  minPrice: number;
  maxPrice: number;
  rating: number;
  reviewCount: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  showOnHomepage: boolean;
  homepageOrder: number;
  tags: string[];
  specifications: IProductSpecification[] | Record<string, string>;
  seo: IProductSeo;
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    alt: { type: String, default: "" },
    caption: { type: String, default: "" },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProductSeoSchema = new Schema<IProductSeo>(
  {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    focusKeyword: { type: String, default: "" },
    canonicalUrl: { type: String, default: "" },
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    noIndex: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    sku: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      default: () => `QP-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    },
    shortDescription: { type: String, default: "" },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", index: true },
    subcategory: { type: String, default: "" },
    images: { type: [ProductImageSchema], default: [] },
    thumbnail: { type: String, default: "" },
    approximatePrice: { type: String, default: "" },
    priceUnit: { type: String, default: "Piece" },
    minimumOrderQuantity: { type: String, default: "" },
    manufacturingTime: { type: String, default: "" },
    additionalInformation: { type: String, default: "" },
    basePrice: { type: Number, default: 0, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    minPrice: { type: Number, default: 0, min: 0 },
    maxPrice: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 1000, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    showOnHomepage: { type: Boolean, default: false, index: true },
    homepageOrder: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
    specifications: { type: Schema.Types.Mixed, default: [] },
    seo: { type: ProductSeoSchema, default: () => ({}) },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ name: "text", shortDescription: "text", tags: "text", subcategory: "text" });

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
