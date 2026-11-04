import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomerLedger extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  orderId?: mongoose.Types.ObjectId;
  orderNumber?: string;
  date: Date;
  transactionType: "INVOICE" | "PAYMENT" | "CREDIT_NOTE" | "DEBIT_NOTE" | "REFUND" | "OPENING_BALANCE";
  referenceNumber: string;
  description: string;
  debit: number; // Charges / Invoices increasing amount due
  credit: number; // Payments / Credits reducing amount due
  runningBalance: number;
  reconciled: boolean;
  reconciledBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerLedgerSchema = new Schema<ICustomerLedger>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    companyName: { type: String, required: true },
    orderId: { type: Schema.Types.ObjectId, ref: "CustomOrder" },
    orderNumber: { type: String },
    date: { type: Date, default: Date.now, index: true },
    transactionType: {
      type: String,
      enum: ["INVOICE", "PAYMENT", "CREDIT_NOTE", "DEBIT_NOTE", "REFUND", "OPENING_BALANCE"],
      required: true,
      index: true,
    },
    referenceNumber: { type: String, required: true },
    description: { type: String, required: true },
    debit: { type: Number, default: 0, min: 0 },
    credit: { type: Number, default: 0, min: 0 },
    runningBalance: { type: Number, required: true },
    reconciled: { type: Boolean, default: false },
    reconciledBy: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export const CustomerLedger: Model<ICustomerLedger> =
  mongoose.models.CustomerLedger ||
  mongoose.model<ICustomerLedger>("CustomerLedger", CustomerLedgerSchema);
