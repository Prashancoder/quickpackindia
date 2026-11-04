import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISeoSettings extends Document {
  websiteTitle: string;
  websiteDescription: string;
  defaultOgImage: string;
  googleSearchConsoleVerification?: string;
  googleAnalyticsId?: string;
  organizationName: string;
  organizationLegalName: string;
  organizationLogo: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  socialProfiles: string[];
  gstNumber: string;
  updatedAt: Date;
}

const SeoSettingsSchema = new Schema<ISeoSettings>(
  {
    websiteTitle: {
      type: String,
      default: "QuickPack India | Corrugated Box & Packaging Manufacturer",
    },
    websiteDescription: {
      type: String,
      default:
        "QuickPack India manufactures premium corrugated boxes, mailer boxes, mono cartons and paper bags for businesses across India with factory-direct pricing since 1991.",
    },
    defaultOgImage: { type: String, default: "" },
    googleSearchConsoleVerification: { type: String, default: "" },
    googleAnalyticsId: { type: String, default: "G-5YB37D05GM" },
    organizationName: { type: String, default: "QuickPack India" },
    organizationLegalName: { type: String, default: "Krishna Traders" },
    organizationLogo: { type: String, default: "" },
    businessPhone: { type: String, default: "+91 9871002637" },
    businessEmail: { type: String, default: "sales@quickpack.in" },
    businessAddress: {
      streetAddress: { type: String, default: "Packaging Industrial Zone" },
      addressLocality: { type: String, default: "New Delhi" },
      addressRegion: { type: String, default: "Delhi NCR" },
      postalCode: { type: String, default: "110020" },
      addressCountry: { type: String, default: "IN" },
    },
    socialProfiles: { type: [String], default: [] },
    gstNumber: { type: String, default: "07AAAAA0000A1Z5" },
  },
  {
    timestamps: true,
  }
);

export const SeoSettings: Model<ISeoSettings> =
  mongoose.models.SeoSettings || mongoose.model<ISeoSettings>("SeoSettings", SeoSettingsSchema);
