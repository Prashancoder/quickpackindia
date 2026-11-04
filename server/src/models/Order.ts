import mongoose, { Schema, Document, Model } from "mongoose";
import { IAddress } from "./User";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  productName: string;
  sku: string;
  variantOptions?: {
    topPaper?: string;
    packQuantity?: number;
    size?: string;
    [key: string]: any;
  };
  image: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IAddress;
  billingAddress?: IAddress;
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingCharge: number;
  tax: number; // GST 18%
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentGateway?: string; // "RAZORPAY" | "CASHFREE"
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentSignature?: string;
  cashfreePaymentSessionId?: string;
  notes?: string;
  estimatedDeliveryDate?: Date;
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant" },
    productName: { type: String, required: true },
    sku: { type: String, default: "" },
    variantOptions: { type: Schema.Types.Mixed, default: {} },
    image: { type: String, default: "" },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);


const AddressSchema = new Schema(
  {
    fullName: { type: String, default: "" },
    phone: { type: String, default: "" },
    houseFlat: { type: String, default: "" },
    street: { type: String, default: "" },
    area: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    landmark: { type: String, default: "" },
  },
  { _id: false }
);


const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    items: [OrderItemSchema],
    shippingAddress: { type: AddressSchema, required: true },
    billingAddress: { type: AddressSchema },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String },
    shippingCharge: { type: Number, default: 0, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    paymentGateway: { type: String, default: "RAZORPAY" },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String },
    paymentSignature: { type: String },
    cashfreePaymentSessionId: { type: String },
    notes: { type: String },
    estimatedDeliveryDate: { type: Date },
    trackingNumber: { type: String },
    trackingUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
