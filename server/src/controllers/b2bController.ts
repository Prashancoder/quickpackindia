import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { CustomOrder, ICustomOrder, CustomOrderStatus } from "../models/CustomOrder";
import { Quotation, IQuotation } from "../models/Quotation";
import { CustomerLedger } from "../models/CustomerLedger";
import { User } from "../models/User";

// ==========================================================
// CUSTOMER B2B ENDPOINTS
// ==========================================================

export async function getBusinessMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const userId = req.user._id;

    // Fetch user orders, quotes, payments
    const [orders, quotations] = await Promise.all([
      CustomOrder.find({ userId }).sort({ createdAt: -1 }).lean(),
      Quotation.find({ $or: [{ userId }, { email: req.user.email }] }).sort({ createdAt: -1 }).lean(),
    ]);

    let totalOutstandingBalance = 0;
    let totalPaid = 0;
    let activeOrdersCount = 0;

    orders.forEach((o) => {
      totalOutstandingBalance += o.pricing?.balanceDue || 0;
      totalPaid += o.pricing?.totalPaid || 0;
      if (!["DELIVERED", "CANCELLED"].includes(o.orderStatus)) {
        activeOrdersCount++;
      }
    });

    res.json({
      success: true,
      profile: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        businessProfile: req.user.businessProfile,
      },
      summary: {
        totalOrders: orders.length,
        activeOrders: activeOrdersCount,
        quotationsCount: quotations.length,
        totalPaid: Math.round(totalPaid * 100) / 100,
        totalOutstandingBalance: Math.round(totalOutstandingBalance * 100) / 100,
      },
      recentOrders: orders.slice(0, 5),
      recentQuotations: quotations.slice(0, 5),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch B2B dashboard" });
  }
}

export async function getCustomerOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const orders = await CustomOrder.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch orders" });
  }
}

export async function getCustomerOrderById(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const order = await CustomOrder.findOne({
      $and: [
        { $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }] },
        req.user.role === "ADMIN" ? {} : { userId: req.user._id },
      ],
    }).lean();

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found or unauthorized access" });
      return;
    }

    // Filter customer visible status events for customers
    if (req.user.role !== "ADMIN" && order.statusTimeline) {
      order.statusTimeline = order.statusTimeline.filter((e: any) => e.isCustomerVisible !== false);
    }

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch order details" });
  }
}

export async function getCustomerQuotations(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const quotations = await Quotation.find({
      $or: [{ userId: req.user._id }, { email: req.user.email }],
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, quotations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch quotations" });
  }
}

export async function acceptQuotation(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const quotation = await Quotation.findOne({
      _id: id,
      $or: [{ userId: req.user._id }, { email: req.user.email }],
    });

    if (!quotation) {
      res.status(404).json({ success: false, message: "Quotation not found" });
      return;
    }

    if (quotation.status !== "SENT") {
      res.status(400).json({ success: false, message: `Quotation is in ${quotation.status} status and cannot be accepted.` });
      return;
    }

    if (new Date() > new Date(quotation.validUntil)) {
      quotation.status = "EXPIRED";
      await quotation.save();
      res.status(400).json({ success: false, message: "Quotation has expired. Please request a refreshed quote." });
      return;
    }

    quotation.status = "ACCEPTED";
    await quotation.save();

    res.json({
      success: true,
      message: "Quotation accepted successfully. Our team has been notified to prepare production documentation.",
      quotation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to accept quotation" });
  }
}

export async function rejectQuotation(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const { reason } = req.body;
    const quotation = await Quotation.findOne({
      _id: id,
      $or: [{ userId: req.user._id }, { email: req.user.email }],
    });

    if (!quotation) {
      res.status(404).json({ success: false, message: "Quotation not found" });
      return;
    }

    quotation.status = "REJECTED";
    if (reason) quotation.notes = `${quotation.notes || ""}\nCustomer revision note: ${reason}`;
    await quotation.save();

    res.json({
      success: true,
      message: "Quotation revision request submitted.",
      quotation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to reject quotation" });
  }
}

export async function getCustomerPayments(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const orders = await CustomOrder.find({ userId: req.user._id }, "orderNumber pricing paymentRecords createdAt").lean();

    const allPayments: any[] = [];
    orders.forEach((o) => {
      if (o.paymentRecords && Array.isArray(o.paymentRecords)) {
        o.paymentRecords.forEach((p: any) => {
          allPayments.push({
            ...p,
            orderNumber: o.orderNumber,
            orderTotal: o.pricing?.totalAmount,
            balanceDue: o.pricing?.balanceDue,
          });
        });
      }
    });

    allPayments.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

    res.json({ success: true, payments: allPayments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch payments" });
  }
}

export async function getCustomerDocuments(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const orders = await CustomOrder.find({ userId: req.user._id }, "orderNumber documents createdAt").lean();

    const allDocs: any[] = [];
    orders.forEach((o) => {
      if (o.documents && Array.isArray(o.documents)) {
        o.documents.forEach((d: any) => {
          allDocs.push({
            ...d,
            orderNumber: o.orderNumber,
          });
        });
      }
    });

    allDocs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    res.json({ success: true, documents: allDocs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch documents" });
  }
}

export async function requestReorder(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const { quantity, notes } = req.body;

    const previousOrder = await CustomOrder.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!previousOrder) {
      res.status(404).json({ success: false, message: "Previous order not found." });
      return;
    }

    const reorderQuantity = Number(quantity) || previousOrder.specifications.quantity;

    // As required in Master Prompt Section 10:
    // "On a prior order, show a Reorder action. It should copy the previous specifications
    // into a new draft/enquiry, not silently create a confirmed order or charge the customer."
    const draftNumber = `QUO-REPEAT-${Date.now().toString().slice(-6)}`;

    // Revalidate pricing based on quantity
    const unitPrice = previousOrder.pricing.unitPrice;
    const subtotal = Math.round(unitPrice * reorderQuantity * 100) / 100;
    const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    const newQuotation = await Quotation.create({
      quotationNumber: draftNumber,
      userId: req.user._id,
      customerName: previousOrder.customerName,
      companyName: previousOrder.companyName,
      email: previousOrder.email,
      phone: previousOrder.phone,
      productType: previousOrder.specifications.productType,
      dimensions: previousOrder.specifications.dimensions,
      boardGrade: previousOrder.specifications.boardGrade,
      printing: previousOrder.specifications.printing,
      finish: previousOrder.specifications.finish,
      quantity: reorderQuantity,
      unitPrice,
      subtotal,
      taxRate: 18,
      taxAmount,
      shippingCharge: 0,
      totalAmount,
      advancePercent: 50,
      advanceAmount: Math.round(totalAmount * 0.5 * 100) / 100,
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      estimatedLeadDays: 10,
      status: "DRAFT",
      notes: `Repeat Order from prior Order #${previousOrder.orderNumber}.${notes ? ` Additional customer note: ${notes}` : ""}`,
    });

    res.status(201).json({
      success: true,
      message: `Repeat order enquiry #${draftNumber} created for ${reorderQuantity} units. You can review specifications and confirm.`,
      quotation: newQuotation,
      previousOrderNumber: previousOrder.orderNumber,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create repeat order." });
  }
}

export async function uploadOrderDesign(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const { fileUrl, fileName, fileType, notes } = req.body;

    if (!fileUrl || !fileName) {
      res.status(400).json({ success: false, message: "fileUrl and fileName are required." });
      return;
    }

    const order = await CustomOrder.findOne({
      _id: id,
      $or: [{ userId: req.user._id }, ...(req.user.role === "ADMIN" ? [{}] : [])],
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    const nextVersion = (order.designFiles?.length || 0) + 1;

    order.designFiles.push({
      version: nextVersion,
      fileUrl,
      fileName,
      fileType: fileType || "image/png",
      uploadedAt: new Date(),
      uploadedBy: req.user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
      approvalStatus: "PENDING",
      notes,
    });

    order.designApprovalStatus = "AWAITING_CUSTOMER_APPROVAL";

    order.statusTimeline.push({
      status: order.orderStatus,
      timestamp: new Date(),
      note: `Artwork proof version ${nextVersion} submitted for review.`,
      updatedBy: req.user.name,
      isCustomerVisible: true,
    });

    await order.save();

    res.json({
      success: true,
      message: `Artwork proof v${nextVersion} uploaded successfully.`,
      designFiles: order.designFiles,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to upload design." });
  }
}

export async function approveOrderDesign(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const { version, notes } = req.body;

    const order = await CustomOrder.findOne({
      _id: id,
      $or: [{ userId: req.user._id }, ...(req.user.role === "ADMIN" ? [{}] : [])],
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    const file = order.designFiles.find((f) => f.version === Number(version));
    if (!file) {
      res.status(404).json({ success: false, message: `Design version ${version} not found.` });
      return;
    }

    file.approvalStatus = "APPROVED";
    file.approvedAt = new Date();
    file.approvedBy = req.user.name;
    file.notes = notes;

    order.approvedDesignVersion = file.version;
    order.designApprovalStatus = "APPROVED";
    order.dates.designApprovedDate = new Date();

    // Calculate estimated completion date (e.g. 10 business days from approval)
    const estimatedCompletion = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    order.dates.estimatedCompletionDate = estimatedCompletion;

    if (order.pricing.advancePaid >= order.pricing.advanceRequired) {
      order.orderStatus = "APPROVED_FOR_PRODUCTION";
      order.dates.productionStartDate = new Date();
    }

    order.statusTimeline.push({
      status: order.orderStatus,
      timestamp: new Date(),
      note: `Design version ${version} approved by ${req.user.name}. Production lead time initiated.`,
      updatedBy: req.user.name,
      isCustomerVisible: true,
    });

    await order.save();

    res.json({
      success: true,
      message: `Design version ${version} approved! Production estimated completion: ${estimatedCompletion.toLocaleDateString("en-IN")}`,
      order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to approve design." });
  }
}

// ==========================================================
// ADMIN B2B CRM ENDPOINTS
// ==========================================================

export async function getAdminB2BOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, paymentStatus, search, page = "1", limit = "20" } = req.query as Record<string, string>;

    const query: any = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const p = Math.max(Number(page) || 1, 1);
    const lim = Math.max(Number(limit) || 20, 1);

    const [orders, total] = await Promise.all([
      CustomOrder.find(query)
        .sort({ createdAt: -1 })
        .skip((p - 1) * lim)
        .limit(lim)
        .lean(),
      CustomOrder.countDocuments(query),
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: p,
        pages: Math.ceil(total / lim),
        limit: lim,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch admin B2B orders" });
  }
}

export async function createAdminCustomOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      userId,
      customerName,
      companyName,
      email,
      phone,
      gstin,
      deliveryAddress,
      specifications,
      pricing,
      estimatedLeadDays = 10,
      notes,
      internalNotes,
    } = req.body;

    if (!customerName || !email || !phone || !specifications || !pricing) {
      res.status(400).json({ success: false, message: "Required customer, specifications, and pricing fields missing." });
      return;
    }

    const orderNumber = `B2B-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const advanceRequired = pricing.advanceRequired ?? Math.round(pricing.totalAmount * 0.5 * 100) / 100;
    const balanceDue = Math.round((pricing.totalAmount - (pricing.advancePaid || 0)) * 100) / 100;

    const order = await CustomOrder.create({
      orderNumber,
      userId: userId || undefined,
      customerName: customerName.trim(),
      companyName: (companyName || customerName).trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      gstin: gstin?.trim()?.toUpperCase(),
      deliveryAddress: deliveryAddress || {
        fullName: customerName,
        phone,
        houseFlat: "Plot 1",
        street: "Industrial Estate",
        area: "Sector 1",
        city: "Delhi",
        state: "Delhi",
        pincode: "110020",
      },
      specifications,
      pricing: {
        unitPrice: pricing.unitPrice,
        subtotal: pricing.subtotal,
        taxRate: pricing.taxRate || 18,
        taxAmount: pricing.taxAmount,
        shippingCharge: pricing.shippingCharge || 0,
        totalAmount: pricing.totalAmount,
        advanceRequired,
        advancePaid: pricing.advancePaid || 0,
        totalPaid: pricing.advancePaid || 0,
        balanceDue,
      },
      paymentStatus: (pricing.advancePaid || 0) >= advanceRequired ? "PARTIALLY_PAID" : "ADVANCE_DUE",
      orderStatus: "AWAITING_ADVANCE",
      statusTimeline: [
        {
          status: "AWAITING_ADVANCE",
          timestamp: new Date(),
          note: `Custom order #${orderNumber} created by QuickPack admin.`,
          updatedBy: req.user?.name || "Admin",
          isCustomerVisible: true,
        },
      ],
      dates: {
        orderDate: new Date(),
      },
      notes,
      internalNotes,
    });

    // Record initial ledger entry for the order invoice
    if (userId) {
      await CustomerLedger.create({
        userId,
        companyName: order.companyName,
        orderId: order._id,
        orderNumber: order.orderNumber,
        date: new Date(),
        transactionType: "INVOICE",
        referenceNumber: `INV-${order.orderNumber}`,
        description: `Custom order #${order.orderNumber} placed: ${order.specifications.quantity} pcs of ${order.specifications.productType}`,
        debit: order.pricing.totalAmount,
        credit: 0,
        runningBalance: order.pricing.totalAmount,
        reconciled: true,
      });
    }

    res.status(201).json({
      success: true,
      message: `Custom manufacturing order #${orderNumber} created successfully.`,
      order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create custom order" });
  }
}

export async function updateAdminCustomOrderStatus(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, note, isCustomerVisible, estimatedCompletionDate, courierName, trackingNumber } = req.body;

    const order = await CustomOrder.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    order.orderStatus = status;

    if (estimatedCompletionDate) {
      order.dates.estimatedCompletionDate = new Date(estimatedCompletionDate);
    }
    if (courierName) order.shipping.courierName = courierName;
    if (trackingNumber) order.shipping.trackingNumber = trackingNumber;

    if (status === "IN_PRODUCTION" && !order.dates.productionStartDate) {
      order.dates.productionStartDate = new Date();
    } else if (status === "DISPATCHED" && !order.dates.dispatchDate) {
      order.dates.dispatchDate = new Date();
    } else if (status === "DELIVERED" && !order.dates.deliveryDate) {
      order.dates.deliveryDate = new Date();
    }

    order.statusTimeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`,
      updatedBy: req.user?.name || "Admin",
      isCustomerVisible: isCustomerVisible !== false,
    });

    await order.save();

    res.json({
      success: true,
      message: `Order #${order.orderNumber} status updated to ${status}.`,
      order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update order status" });
  }
}

export async function recordAdminCustomOrderPayment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, transactionReference, receiptUrl, notes, markVerified } = req.body;

    if (!amount || !paymentMethod || !transactionReference) {
      res.status(400).json({ success: false, message: "amount, paymentMethod, and transactionReference are required." });
      return;
    }

    const order = await CustomOrder.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    const paymentAmount = Number(amount);
    const paymentId = `PAY-${Date.now().toString().slice(-6)}`;
    const isVerified = markVerified === true;

    order.paymentRecords.push({
      paymentId,
      amount: paymentAmount,
      paymentMethod,
      transactionReference,
      status: isVerified ? "VERIFIED" : "RECORDED_PENDING_VERIFICATION",
      recordedAt: new Date(),
      verifiedAt: isVerified ? new Date() : undefined,
      verifiedBy: isVerified ? req.user?.name || "Admin" : undefined,
      receiptUrl,
      notes,
    });

    if (isVerified) {
      order.pricing.totalPaid = Math.round(((order.pricing.totalPaid || 0) + paymentAmount) * 100) / 100;
      order.pricing.advancePaid = Math.min(order.pricing.totalPaid, order.pricing.advanceRequired);
      order.pricing.balanceDue = Math.max(Math.round((order.pricing.totalAmount - order.pricing.totalPaid) * 100) / 100, 0);

      if (order.pricing.balanceDue <= 0) {
        order.paymentStatus = "PAID";
      } else if (order.pricing.advancePaid >= order.pricing.advanceRequired) {
        order.paymentStatus = "PARTIALLY_PAID";
      }

      // Add entry to customer ledger
      if (order.userId) {
        const lastLedger = await CustomerLedger.findOne({ userId: order.userId }).sort({ date: -1 });
        const prevBalance = lastLedger ? lastLedger.runningBalance : order.pricing.totalAmount;
        const newBalance = Math.max(prevBalance - paymentAmount, 0);

        await CustomerLedger.create({
          userId: order.userId,
          companyName: order.companyName,
          orderId: order._id,
          orderNumber: order.orderNumber,
          date: new Date(),
          transactionType: "PAYMENT",
          referenceNumber: transactionReference,
          description: `Payment received via ${paymentMethod} (Ref: ${transactionReference}) for Order #${order.orderNumber}`,
          debit: 0,
          credit: paymentAmount,
          runningBalance: newBalance,
          reconciled: true,
          reconciledBy: req.user?.name || "Admin",
          notes,
        });
      }
    } else {
      order.paymentStatus = "PENDING_VERIFICATION";
    }

    await order.save();

    res.status(201).json({
      success: true,
      message: `Payment of ₹${paymentAmount} recorded (${isVerified ? "Verified" : "Pending Verification"}).`,
      order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to record payment" });
  }
}

export async function reconcilePayment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params; // orderId or paymentId
    const { paymentId, verified } = req.body;

    const order = await CustomOrder.findOne({
      "paymentRecords.paymentId": paymentId || id,
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Payment record not found." });
      return;
    }

    const pRecord = order.paymentRecords.find((p) => p.paymentId === (paymentId || id));
    if (!pRecord) {
      res.status(404).json({ success: false, message: "Payment entry not found." });
      return;
    }

    if (verified) {
      pRecord.status = "VERIFIED";
      pRecord.verifiedAt = new Date();
      pRecord.verifiedBy = req.user?.name || "Admin";

      // Recalculate order totals from verified payments
      const verifiedTotal = order.paymentRecords
        .filter((p) => p.status === "VERIFIED")
        .reduce((sum, p) => sum + p.amount, 0);

      order.pricing.totalPaid = Math.round(verifiedTotal * 100) / 100;
      order.pricing.advancePaid = Math.min(order.pricing.totalPaid, order.pricing.advanceRequired);
      order.pricing.balanceDue = Math.max(Math.round((order.pricing.totalAmount - order.pricing.totalPaid) * 100) / 100, 0);

      if (order.pricing.balanceDue <= 0) {
        order.paymentStatus = "PAID";
      } else if (order.pricing.advancePaid >= order.pricing.advanceRequired) {
        order.paymentStatus = "PARTIALLY_PAID";
      }
    } else {
      pRecord.status = "REJECTED";
    }

    await order.save();

    res.json({
      success: true,
      message: `Payment ${pRecord.paymentId} marked as ${pRecord.status}.`,
      order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to reconcile payment" });
  }
}

export async function attachAdminDocument(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { docType, title, fileUrl, size } = req.body;

    if (!docType || !title || !fileUrl) {
      res.status(400).json({ success: false, message: "docType, title, and fileUrl are required." });
      return;
    }

    const order = await CustomOrder.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    order.documents.push({
      docType,
      title,
      fileUrl,
      uploadedAt: new Date(),
      uploadedBy: req.user?.name || "Admin",
      size,
    });

    await order.save();

    res.json({
      success: true,
      message: `Document "${title}" attached to order #${order.orderNumber}.`,
      documents: order.documents,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to attach document" });
  }
}

export async function getAdminQuotations(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, search } = req.query as Record<string, string>;
    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { quotationNumber: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const quotations = await Quotation.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, quotations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch quotations" });
  }
}

export async function convertQuotationToOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const quotation = await Quotation.findById(id);

    if (!quotation) {
      res.status(404).json({ success: false, message: "Quotation not found." });
      return;
    }

    const orderNumber = `B2B-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const customOrder = await CustomOrder.create({
      orderNumber,
      userId: quotation.userId,
      quotationId: quotation._id,
      customerName: quotation.customerName,
      companyName: quotation.companyName,
      email: quotation.email,
      phone: quotation.phone,
      deliveryAddress: {
        fullName: quotation.customerName,
        phone: quotation.phone,
        houseFlat: "Plot 1",
        street: "Industrial Estate",
        area: "Sector 1",
        city: "Delhi",
        state: "Delhi",
        pincode: "110020",
      },
      specifications: {
        productType: quotation.productType,
        dimensions: quotation.dimensions,
        boardGrade: quotation.boardGrade,
        printing: quotation.printing,
        finish: quotation.finish,
        quantity: quotation.quantity,
      },
      pricing: {
        unitPrice: quotation.unitPrice,
        subtotal: quotation.subtotal,
        taxRate: quotation.taxRate,
        taxAmount: quotation.taxAmount,
        shippingCharge: quotation.shippingCharge,
        totalAmount: quotation.totalAmount,
        advanceRequired: quotation.advanceAmount,
        advancePaid: 0,
        totalPaid: 0,
        balanceDue: quotation.totalAmount,
      },
      paymentStatus: "ADVANCE_DUE",
      orderStatus: "AWAITING_ADVANCE",
      statusTimeline: [
        {
          status: "AWAITING_ADVANCE",
          timestamp: new Date(),
          note: `Converted from Quotation #${quotation.quotationNumber}.`,
          updatedBy: req.user?.name || "Admin",
          isCustomerVisible: true,
        },
      ],
      dates: {
        orderDate: new Date(),
      },
      notes: quotation.notes,
    });

    quotation.status = "CONVERTED_TO_ORDER";
    quotation.createdOrderId = customOrder._id as any;
    await quotation.save();

    res.status(201).json({
      success: true,
      message: `Quotation converted to Custom Order #${orderNumber}.`,
      order: customOrder,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to convert quotation" });
  }
}

export async function getBusinessCustomers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const customers = await User.find(
      { $or: [{ role: "BUSINESS" }, { "businessProfile.companyName": { $exists: true, $ne: "" } }] },
      "name email phone role businessProfile createdAt"
    ).lean();

    // Enrich with order and revenue statistics
    const enriched = await Promise.all(
      customers.map(async (c) => {
        const orders = await CustomOrder.find({ userId: c._id }, "pricing orderStatus").lean();
        const totalOrders = orders.length;
        const totalInvoiced = orders.reduce((sum, o) => sum + (o.pricing?.totalAmount || 0), 0);
        const totalPaid = orders.reduce((sum, o) => sum + (o.pricing?.totalPaid || 0), 0);
        const outstandingBalance = orders.reduce((sum, o) => sum + (o.pricing?.balanceDue || 0), 0);

        return {
          ...c,
          totalOrders,
          totalInvoiced: Math.round(totalInvoiced * 100) / 100,
          totalPaid: Math.round(totalPaid * 100) / 100,
          outstandingBalance: Math.round(outstandingBalance * 100) / 100,
        };
      })
    );

    res.json({ success: true, customers: enriched });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch business customers" });
  }
}

export async function getCustomerLedgerReport(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId, startDate, endDate } = req.query as Record<string, string>;

    const query: any = {};
    if (userId) query.userId = userId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const ledgerEntries = await CustomerLedger.find(query).sort({ date: 1 }).lean();

    let totalDebit = 0;
    let totalCredit = 0;
    ledgerEntries.forEach((e) => {
      totalDebit += e.debit || 0;
      totalCredit += e.credit || 0;
    });

    const netOutstanding = Math.round((totalDebit - totalCredit) * 100) / 100;

    res.json({
      success: true,
      entries: ledgerEntries,
      summary: {
        totalDebit: Math.round(totalDebit * 100) / 100,
        totalCredit: Math.round(totalCredit * 100) / 100,
        netOutstanding,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch customer ledger" });
  }
}
