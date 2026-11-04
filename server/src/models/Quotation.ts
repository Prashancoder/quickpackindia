import mongoose, { Schema, Document, Model } from "mongoose";

export type QuotationStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CONVERTED_TO_ORDER";

export interface IQuotation extends Document {
  quotationNumber: string;
  userId?: mongoose.Types.ObjectId;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  productType: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
    unit: "inch" | "cm" | "mm";
  };
  boardGrade: string;
  printing: string;
  finish: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxRate: number; // default 18%
  taxAmount: number;
  shippingCharge: number;
  totalAmount: number;
  advancePercent: number; // e.g. 50%
  advanceAmount: number;
  validUntil: Date;
  estimatedLeadDays: number;
  status: QuotationStatus;
  notes?: string;
  internalNotes?: string;
  createdOrderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuotationSchema = new Schema<IQuotation>(
  {
    quotationNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    customerName: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    productType: { type: String, required: true },
    dimensions: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      unit: { type: String, enum: ["inch", "cm", "mm"], default: "inch" },
    },
    boardGrade: { type: String, required: true },
    printing: { type: String, default: "Plain" },
    finish: { type: String, default: "None" },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, default: 18 },
    taxAmount: { type: Number, required: true, min: 0 },
    shippingCharge: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    advancePercent: { type: Number, default: 50, min: 0, max: 100 },
    advanceAmount: { type: Number, required: true, min: 0 },
    validUntil: { type: Date, required: true },
    estimatedLeadDays: { type: Number, default: 10 },
    status: {
      type: String,
      enum: ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED", "CONVERTED_TO_ORDER"],
      default: "DRAFT",
      index: true,
    },
    notes: { type: String },
    internalNotes: { type: String },
    createdOrderId: { type: Schema.Types.ObjectId, ref: "CustomOrder" },
  },
  {
    timestamps: true,
  }
);

export const Quotation: Model<IQuotation> =
  mongoose.models.Quotation || mongoose.model<IQuotation>("Quotation", QuotationSchema);
