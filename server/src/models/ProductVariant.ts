import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductVariant extends Document {
  productId: mongoose.Types.ObjectId;
  sku: string;
  options: {
    topPaper?: string;       // "White" | "Brown" | "Logo Printed"
    packQuantity?: number;   // 100 | 200 | 500 | 1000 | 3000 | 5000
    size?: string;           // "4 X 4 X 1.5 Inch"
    ply?: string;            // "3 Ply" | "5 Ply" | "7 Ply"
    [key: string]: any;
  };
  price: number;
  compareAtPrice?: number;
  unitPricePerBox?: number;  // Price divided by pack quantity e.g. 8.92
  stock: number;
  weight?: number;          // in grams
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    options: {
      topPaper: { type: String, trim: true },
      packQuantity: { type: Number },
      size: { type: String, trim: true },
      ply: { type: String, trim: true },
    },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    unitPricePerBox: { type: Number, min: 0 },
    stock: { type: Number, default: 500, min: 0 },
    weight: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
  }
);

ProductVariantSchema.index({ productId: 1, "options.topPaper": 1, "options.packQuantity": 1 });

export const ProductVariant: Model<IProductVariant> =
  mongoose.models.ProductVariant ||
  mongoose.model<IProductVariant>("ProductVariant", ProductVariantSchema);
