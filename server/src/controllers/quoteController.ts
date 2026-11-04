import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Quotation } from "../models/Quotation";

interface QuoteCalculationParams {
  productType: string;
  length: number;
  width: number;
  height: number;
  unit?: "inch" | "cm" | "mm";
  boardGrade: string;
  printing?: string;
  finish?: string;
  quantity: number;
}

export function computePackagingQuote(params: QuoteCalculationParams) {
  const unit = params.unit || "inch";
  let l = Number(params.length) || 4;
  let w = Number(params.width) || 4;
  let h = Number(params.height) || 2;
  const qty = Math.max(Number(params.quantity) || 100, 50);

  // Convert to inches for standard calculation
  if (unit === "cm") {
    l = l / 2.54;
    w = w / 2.54;
    h = h / 2.54;
  } else if (unit === "mm") {
    l = l / 25.4;
    w = w / 25.4;
    h = h / 25.4;
  }

  // Corrugated Sheet Area calculation (Length + Width + 2" trim) * (Width + Height + 1" flap) * 2 / 144 sq ft
  const sheetWidth = 2 * (l + w) + 2.5; // circumference + joint
  const sheetHeight = w + h + 1.5; // depth + top/bottom flaps
  const areaSqInches = sheetWidth * sheetHeight;

  // Board grade factor (price per sq inch of corrugated board)
  let ratePerSqInch = 0.0075; // Standard 3-ply Kraft
  if (params.boardGrade.includes("5 Ply") || params.boardGrade.includes("5-ply")) {
    ratePerSqInch = 0.0135;
  } else if (params.boardGrade.includes("7 Ply") || params.boardGrade.includes("7-ply")) {
    ratePerSqInch = 0.021;
  } else if (params.boardGrade.includes("Duplex") || params.boardGrade.includes("Mono")) {
    ratePerSqInch = 0.011;
  } else if (params.boardGrade.includes("Rigid")) {
    ratePerSqInch = 0.032;
  }

  // Base raw material cost
  let rawMaterialCost = areaSqInches * ratePerSqInch;

  // Printing cost per unit based on print type and volume
  let printCost = 0;
  const printing = params.printing || "Plain";
  if (printing.includes("1 Color") || printing.includes("1-color") || printing.includes("Logo Printed")) {
    const plateCharge = 1500;
    const perBoxPrint = 0.85;
    printCost = plateCharge / qty + perBoxPrint;
  } else if (printing.includes("2 Color") || printing.includes("2-color")) {
    const plateCharge = 2800;
    const perBoxPrint = 1.35;
    printCost = plateCharge / qty + perBoxPrint;
  } else if (printing.includes("Full Color") || printing.includes("CMYK") || printing.includes("Offset")) {
    const plateCharge = 4500;
    const perBoxPrint = 2.2;
    printCost = plateCharge / qty + perBoxPrint;
  }

  // Finishing & Lamination
  let finishCost = 0;
  const finish = params.finish || "None";
  if (finish.includes("Gloss") || finish.includes("Matte")) {
    finishCost = (areaSqInches / 144) * 0.95; // ~₹0.95 per sq ft
  } else if (finish.includes("UV")) {
    finishCost = (areaSqInches / 144) * 1.45;
  }

  // Conversion & pasting cost
  const conversionCost = 1.25;

  // Quantity tier volume efficiency discount
  let volumeMultiplier = 1.0;
  if (qty >= 10000) volumeMultiplier = 0.78;
  else if (qty >= 5000) volumeMultiplier = 0.84;
  else if (qty >= 2000) volumeMultiplier = 0.90;
  else if (qty >= 1000) volumeMultiplier = 0.94;
  else if (qty >= 500) volumeMultiplier = 0.97;

  // Unit Price (Minimum base floor ₹3.50)
  const estimatedUnitPrice =
    Math.round(
      Math.max((rawMaterialCost + printCost + finishCost + conversionCost) * volumeMultiplier, 3.5) * 100
    ) / 100;

  const subtotal = Math.round(estimatedUnitPrice * qty * 100) / 100;
  const taxRate = 18;
  const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;
  const shippingCharge = subtotal >= 5000 ? 0 : 450;
  const totalAmount = Math.round((subtotal + taxAmount + shippingCharge) * 100) / 100;

  // Estimated lead time in working days
  let estimatedLeadDays = 7;
  if (printing !== "Plain" || finish !== "None") {
    estimatedLeadDays = qty > 5000 ? 12 : 9;
  }

  return {
    dimensions: { length: params.length, width: params.width, height: params.height, unit },
    boardGrade: params.boardGrade,
    printing,
    finish,
    quantity: qty,
    estimatedUnitPrice,
    subtotal,
    taxRate,
    taxAmount,
    shippingCharge,
    totalAmount,
    advanceAmount: Math.round(totalAmount * 0.5 * 100) / 100, // 50% advance standard
    estimatedLeadDays,
    currency: "INR",
  };
}

export async function calculateQuote(req: Request, res: Response): Promise<void> {
  try {
    const { productType, length, width, height, unit, boardGrade, printing, finish, quantity } = req.body;

    if (!length || !width || !height || !quantity) {
      res.status(400).json({ success: false, message: "Length, width, height, and quantity are required." });
      return;
    }

    const result = computePackagingQuote({
      productType: productType || "Corrugated Packaging Box",
      length: Number(length),
      width: Number(width),
      height: Number(height),
      unit: unit || "inch",
      boardGrade: boardGrade || "3 Ply (B-Flute)",
      printing: printing || "Plain",
      finish: finish || "None",
      quantity: Number(quantity),
    });

    res.json({
      success: true,
      calculation: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to calculate quote." });
  }
}

export async function submitQuoteRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      customerName,
      companyName,
      email,
      phone,
      productType,
      length,
      width,
      height,
      unit,
      boardGrade,
      printing,
      finish,
      quantity,
      notes,
    } = req.body;

    if (!customerName || !email || !phone || !length || !width || !height || !quantity) {
      res.status(400).json({
        success: false,
        message: "Customer name, email, phone, dimensions, and quantity are required to submit quote request.",
      });
      return;
    }

    const calc = computePackagingQuote({
      productType: productType || "Corrugated Packaging Box",
      length: Number(length),
      width: Number(width),
      height: Number(height),
      unit: unit || "inch",
      boardGrade: boardGrade || "3 Ply (B-Flute)",
      printing: printing || "Plain",
      finish: finish || "None",
      quantity: Number(quantity),
    });

    const quotationNumber = `QUO-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const validUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days validity

    const quotation = await Quotation.create({
      quotationNumber,
      userId: req.user ? req.user._id : undefined,
      customerName: customerName.trim(),
      companyName: (companyName || customerName).trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      productType: productType || "Corrugated Packaging Box",
      dimensions: calc.dimensions,
      boardGrade: calc.boardGrade,
      printing: calc.printing,
      finish: calc.finish,
      quantity: calc.quantity,
      unitPrice: calc.estimatedUnitPrice,
      subtotal: calc.subtotal,
      taxRate: calc.taxRate,
      taxAmount: calc.taxAmount,
      shippingCharge: calc.shippingCharge,
      totalAmount: calc.totalAmount,
      advancePercent: 50,
      advanceAmount: calc.advanceAmount,
      validUntil,
      estimatedLeadDays: calc.estimatedLeadDays,
      status: "SENT",
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Quotation request submitted successfully. Our engineering team has prepared an instant estimate.",
      quotation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to submit quote request." });
  }
}
