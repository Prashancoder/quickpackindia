import mongoose, { Schema, Document, Model } from "mongoose";

export type EnquiryType = "REQUEST_CALLBACK" | "GET_QUOTE" | "INTERESTED";
export type EnquiryStatus = "NEW" | "CONTACTED" | "CONVERTED" | "CLOSED";

export interface IProductEnquiry extends Document {
  productId?: mongoose.Types.ObjectId;
  productName: string;
  productSlug?: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  companyName?: string;
  requiredQuantity: string;
  message?: string;
  enquiryType: EnquiryType;
  status: EnquiryStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductEnquirySchema = new Schema<IProductEnquiry>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", index: true },
    productName: { type: String, required: true, trim: true },
    productSlug: { type: String, trim: true },
    customerName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    companyName: { type: String, default: "", trim: true },
    requiredQuantity: { type: String, required: true, trim: true },
    message: { type: String, default: "", trim: true },
    enquiryType: {
      type: String,
      enum: ["REQUEST_CALLBACK", "GET_QUOTE", "INTERESTED"],
      default: "GET_QUOTE",
      index: true,
    },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "CONVERTED", "CLOSED"],
      default: "NEW",
      index: true,
    },
    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

ProductEnquirySchema.index({ customerName: "text", productName: "text", companyName: "text" });

export const ProductEnquiry: Model<IProductEnquiry> =
  mongoose.models.ProductEnquiry ||
  mongoose.model<IProductEnquiry>("ProductEnquiry", ProductEnquirySchema);

