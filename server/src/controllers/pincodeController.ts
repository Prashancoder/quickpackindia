import { Request, Response } from "express";
import { Pincode } from "../models/Pincode";

export async function checkPincode(req: Request, res: Response): Promise<void> {
  try {
    const { pincode } = req.query;

    if (!pincode || typeof pincode !== "string" || !/^\d{6}$/.test(pincode.trim())) {
      res.status(400).json({ success: false, message: "Please provide a valid 6-digit PIN code." });
      return;
    }

    const pin = pincode.trim();
    let record = await Pincode.findOne({ pincode: pin });

    // If not in DB, calculate dynamic smart response for Indian pincodes
    if (!record) {
      // Pincode prefix zone detection (1: North/Delhi, 2: UP/UK, 3: Rajasthan/Gujarat, 4: Maharashtra/MP, 5: AP/Telangana, 6: TN/Kerala/Karnataka, 7: East, 8: Bihar/Jharkhand)
      const prefix = pin[0];
      const isDelhiNCR = pin.startsWith("11") || pin.startsWith("201") || pin.startsWith("122");
      const minDays = isDelhiNCR ? 1 : prefix === "1" || prefix === "2" ? 2 : 3;
      const maxDays = isDelhiNCR ? 2 : prefix === "1" || prefix === "2" ? 4 : 5;

      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + maxDays);

      res.json({
        success: true,
        pincode: pin,
        isServiceable: true,
        city: isDelhiNCR ? "Delhi NCR" : "All India Metro",
        state: isDelhiNCR ? "Delhi" : "India",
        estimatedDaysMin: minDays,
        estimatedDaysMax: maxDays,
        estimatedDeliveryDate: estimatedDate.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        freeShipping: true,
        expressAvailable: true,
        message: `Delivery available in ${minDays}-${maxDays} business days. Free Shipping.`,
      });
      return;
    }

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + record.estimatedDaysMax);

    res.json({
      success: true,
      pincode: record.pincode,
      isServiceable: record.isServiceable,
      city: record.city,
      state: record.state,
      estimatedDaysMin: record.estimatedDaysMin,
      estimatedDaysMax: record.estimatedDaysMax,
      estimatedDeliveryDate: estimatedDate.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      freeShipping: true,
      expressAvailable: record.expressAvailable,
      message: record.isServiceable
        ? `Delivery available to ${record.city} in ${record.estimatedDaysMin}-${record.estimatedDaysMax} business days.`
        : `Sorry, we currently do not deliver to ${record.pincode}.`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to check PIN code." });
  }
}
