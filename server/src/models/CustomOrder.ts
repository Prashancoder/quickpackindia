import mongoose, { Schema, Document, Model } from "mongoose";

export type CustomOrderStatus =
  | "ENQUIRY_RECEIVED"
  | "QUOTATION_PREPARED"
  | "AWAITING_CUSTOMER_APPROVAL"
  | "AWAITING_ADVANCE"
  | "AWAITING_DESIGN"
  | "DESIGN_UNDER_REVIEW"
  | "AWAITING_DESIGN_APPROVAL"
  | "APPROVED_FOR_PRODUCTION"
  | "IN_PRODUCTION"
  | "QUALITY_CHECK"
  | "READY_FOR_DISPATCH"
  | "DISPATCHED"
  | "DELIVERED"
  | "ON_HOLD"
  | "CANCELLED";

export type CustomPaymentStatus =
  | "UNPAID"
  | "ADVANCE_DUE"
  | "PARTIALLY_PAID"
  | "PENDING_VERIFICATION"
  | "PAID"
  | "RECONCILIATION_REQUIRED"
  | "REFUNDED";

export interface IDesignFile {
  version: number;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  uploadedAt: Date;
  uploadedBy: string; // "CUSTOMER" | "ADMIN"
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  approvedAt?: Date;
  approvedBy?: string;
  notes?: string;
}

export interface IPaymentRecord {
  paymentId: string;
  amount: number;
  paymentMethod: "BANK_TRANSFER" | "UPI" | "CHEQUE" | "CASH" | "GATEWAY_RAZORPAY" | "GATEWAY_CASHFREE";
  transactionReference: string;
  status: "RECORDED_PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "REFUNDED";
  recordedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  receiptUrl?: string;
  notes?: string;
}

export interface IOrderDocument {
  docType: "QUOTATION" | "INVOICE" | "RECEIPT" | "DELIVERY_CHALLAN" | "APPROVED_ARTWORK" | "SPEC_SHEET";
  title: string;
  fileUrl: string;
  uploadedAt: Date;
  uploadedBy?: string;
  size?: number;
}

export interface IStatusEvent {
  status: CustomOrderStatus;
  timestamp: Date;
  note?: string;
  updatedBy: string;
  isCustomerVisible: boolean;
}

export interface ICustomOrder extends Document {
  orderNumber: string;
  userId?: mongoose.Types.ObjectId;
  quotationId?: mongoose.Types.ObjectId;
  customerName: string;
  companyName: string;
  email: string;
  phone: string;
  gstin?: string;
  deliveryAddress: {
    fullName: string;
    phone: string;
    houseFlat: string;
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  specifications: {
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
  };
  designFiles: IDesignFile[];
  approvedDesignVersion?: number;
  designApprovalStatus: "PENDING_SUBMISSION" | "UNDER_REVIEW" | "AWAITING_CUSTOMER_APPROVAL" | "APPROVED" | "REJECTED";
  pricing: {
    unitPrice: number;
    subtotal: number;
    taxRate: number; // default 18
    taxAmount: number;
    shippingCharge: number;
    totalAmount: number;
    advanceRequired: number;
    advancePaid: number;
    totalPaid: number;
    balanceDue: number;
  };
  paymentStatus: CustomPaymentStatus;
  orderStatus: CustomOrderStatus;
  paymentRecords: IPaymentRecord[];
  documents: IOrderDocument[];
  statusTimeline: IStatusEvent[];
  dates: {
    orderDate: Date;
    designApprovedDate?: Date;
    productionStartDate?: Date;
    estimatedCompletionDate?: Date;
    actualCompletionDate?: Date;
    dispatchDate?: Date;
    deliveryDate?: Date;
  };
  shipping: {
    courierName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };
  notes?: string;
  internalNotes?: string;
  isRepeatOrder: boolean;
  previousOrderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CustomOrderSchema = new Schema<ICustomOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    quotationId: { type: Schema.Types.ObjectId, ref: "Quotation" },
    customerName: { type: String, required: true, trim: true },
    companyName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    gstin: { type: String, trim: true, uppercase: true },
    deliveryAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      houseFlat: { type: String, required: true },
      street: { type: String, required: true },
      area: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String },
    },
    specifications: {
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
    },
    designFiles: [
      {
        version: { type: Number, required: true },
        fileUrl: { type: String, required: true },
        fileName: { type: String, required: true },
        fileType: { type: String, default: "image/png" },
        fileSize: { type: Number },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: String, default: "CUSTOMER" },
        approvalStatus: {
          type: String,
          enum: ["PENDING", "APPROVED", "REJECTED"],
          default: "PENDING",
        },
        approvedAt: { type: Date },
        approvedBy: { type: String },
        notes: { type: String },
      },
    ],
    approvedDesignVersion: { type: Number },
    designApprovalStatus: {
      type: String,
      enum: ["PENDING_SUBMISSION", "UNDER_REVIEW", "AWAITING_CUSTOMER_APPROVAL", "APPROVED", "REJECTED"],
      default: "PENDING_SUBMISSION",
      index: true,
    },
    pricing: {
      unitPrice: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      taxRate: { type: Number, default: 18 },
      taxAmount: { type: Number, required: true },
      shippingCharge: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      advanceRequired: { type: Number, required: true },
      advancePaid: { type: Number, default: 0 },
      totalPaid: { type: Number, default: 0 },
      balanceDue: { type: Number, required: true },
    },
    paymentStatus: {
      type: String,
      enum: [
        "UNPAID",
        "ADVANCE_DUE",
        "PARTIALLY_PAID",
        "PENDING_VERIFICATION",
        "PAID",
        "RECONCILIATION_REQUIRED",
        "REFUNDED",
      ],
      default: "ADVANCE_DUE",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        "ENQUIRY_RECEIVED",
        "QUOTATION_PREPARED",
        "AWAITING_CUSTOMER_APPROVAL",
        "AWAITING_ADVANCE",
        "AWAITING_DESIGN",
        "DESIGN_UNDER_REVIEW",
        "AWAITING_DESIGN_APPROVAL",
        "APPROVED_FOR_PRODUCTION",
        "IN_PRODUCTION",
        "QUALITY_CHECK",
        "READY_FOR_DISPATCH",
        "DISPATCHED",
        "DELIVERED",
        "ON_HOLD",
        "CANCELLED",
      ],
      default: "ENQUIRY_RECEIVED",
      index: true,
    },
    paymentRecords: [
      {
        paymentId: { type: String, required: true },
        amount: { type: Number, required: true },
        paymentMethod: {
          type: String,
          enum: ["BANK_TRANSFER", "UPI", "CHEQUE", "CASH", "GATEWAY_RAZORPAY", "GATEWAY_CASHFREE"],
          required: true,
        },
        transactionReference: { type: String, required: true },
        status: {
          type: String,
          enum: ["RECORDED_PENDING_VERIFICATION", "VERIFIED", "REJECTED", "REFUNDED"],
          default: "RECORDED_PENDING_VERIFICATION",
        },
        recordedAt: { type: Date, default: Date.now },
        verifiedAt: { type: Date },
        verifiedBy: { type: String },
        receiptUrl: { type: String },
        notes: { type: String },
      },
    ],
    documents: [
      {
        docType: {
          type: String,
          enum: ["QUOTATION", "INVOICE", "RECEIPT", "DELIVERY_CHALLAN", "APPROVED_ARTWORK", "SPEC_SHEET"],
          required: true,
        },
        title: { type: String, required: true },
        fileUrl: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: String },
        size: { type: Number },
      },
    ],
    statusTimeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
        updatedBy: { type: String, required: true },
        isCustomerVisible: { type: Boolean, default: true },
      },
    ],
    dates: {
      orderDate: { type: Date, default: Date.now },
      designApprovedDate: { type: Date },
      productionStartDate: { type: Date },
      estimatedCompletionDate: { type: Date },
      actualCompletionDate: { type: Date },
      dispatchDate: { type: Date },
      deliveryDate: { type: Date },
    },
    shipping: {
      courierName: { type: String },
      trackingNumber: { type: String },
      trackingUrl: { type: String },
    },
    notes: { type: String },
    internalNotes: { type: String },
    isRepeatOrder: { type: Boolean, default: false },
    previousOrderId: { type: Schema.Types.ObjectId, ref: "CustomOrder" },
  },
  {
    timestamps: true,
  }
);

export const CustomOrder: Model<ICustomOrder> =
  mongoose.models.CustomOrder || mongoose.model<ICustomOrder>("CustomOrder", CustomOrderSchema);
