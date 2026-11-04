import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPincode extends Document {
  pincode: string;
  city: string;
  state: string;
  isServiceable: boolean;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  codAvailable: boolean;
  freeShippingAbove: number;
  expressAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PincodeSchema = new Schema<IPincode>(
  {
    pincode: { type: String, required: true, unique: true, index: true, trim: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    isServiceable: { type: Boolean, default: true },
    estimatedDaysMin: { type: Number, default: 2 },
    estimatedDaysMax: { type: Number, default: 4 },
    codAvailable: { type: Boolean, default: false },
    freeShippingAbove: { type: Number, default: 0 }, // 0 = always free shipping
    expressAvailable: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Pincode: Model<IPincode> =
  mongoose.models.Pincode || mongoose.model<IPincode>("Pincode", PincodeSchema);
