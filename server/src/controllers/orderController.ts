import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { ProductVariant } from "../models/ProductVariant";
import { Coupon } from "../models/Coupon";
import { User } from "../models/User";
import { calculateOrderTotals, generateOrderNumber } from "../services/orderService";
import {
  initiatePayment,
  verifyPayment as verifyPaymentGateway,
  getAvailableGateways,
  getDefaultGateway,
  PaymentGateway,
} from "../services/paymentService";

export async function getPaymentGateways(req: Request, res: Response): Promise<void> {
  try {
    const available = getAvailableGateways();
    const defaultGateway = getDefaultGateway();
    res.json({
      success: true,
      availableGateways: available,
      defaultGateway,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createCheckoutSession(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { items, shippingAddress, billingAddress, couponCode, notes, gateway } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: "Cart items are required to create an order." });
      return;
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.pincode || !shippingAddress.phone) {
      res.status(400).json({ success: false, message: "Complete shipping address is required." });
      return;
    }

    // Server-side calculation of all amounts
    const calculation = await calculateOrderTotals({
      items,
      couponCode,
      shippingPincode: shippingAddress.pincode,
    });

    const orderNumber = generateOrderNumber();
    const chosenGateway: PaymentGateway = (gateway || getDefaultGateway()).toUpperCase() as PaymentGateway;

    // Create Payment Session via abstraction
    const paymentResult = await initiatePayment({
      gateway: chosenGateway,
      orderId: orderNumber,
      orderNumber,
      amount: calculation.totalAmount,
      customer: {
        id: req.user ? req.user._id.toString() : undefined,
        name: shippingAddress.fullName,
        email: req.user?.email || "customer@quickpack.in",
        phone: shippingAddress.phone,
      },
      returnUrl: req.body.returnUrl,
    });

    // Create internal Order in DB
    const order = await Order.create({
      userId: req.user ? req.user._id : undefined,
      orderNumber,
      items: calculation.verifiedItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      subtotal: calculation.subtotal,
      discount: calculation.discount,
      couponCode: calculation.couponCode,
      shippingCharge: calculation.shippingCharge,
      tax: calculation.tax,
      totalAmount: calculation.totalAmount,
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
      paymentGateway: paymentResult.gateway,
      razorpayOrderId: paymentResult.gateway === "RAZORPAY" ? paymentResult.razorpayOrderId : undefined,
      cashfreePaymentSessionId:
        paymentResult.gateway === "CASHFREE" ? paymentResult.paymentSessionId : undefined,
      notes,
    });

    res.status(201).json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      amount: calculation.totalAmount,
      currency: "INR",
      payment: paymentResult,
      customer: {
        name: shippingAddress.fullName,
        email: req.user?.email || "customer@quickpack.in",
        phone: shippingAddress.phone,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create checkout session." });
  }
}

export async function verifyPayment(req: Request, res: Response): Promise<void> {
  try {
    const { orderId, orderNumber, gateway, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      req.body;

    const query = orderId
      ? { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }
      : { orderNumber: orderNumber };

    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderNumber: orderNumber || orderId }],
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    // If order already paid, return existing success state idempotently
    if (order.paymentStatus === "PAID") {
      res.json({
        success: true,
        message: "Payment already verified.",
        order,
      });
      return;
    }

    // Gateway verification through unified payment service
    const verifyResult = await verifyPaymentGateway({
      gateway: gateway || (order.paymentGateway as PaymentGateway) || "RAZORPAY",
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrderId || order.razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!verifyResult.success) {
      order.paymentStatus = "FAILED";
      await order.save();
      res.status(400).json({ success: false, message: "Payment signature or transaction verification failed." });
      return;
    }

    // Update order state
    order.paymentStatus = "PAID";
    order.orderStatus = "CONFIRMED";
    if (razorpayPaymentId) order.razorpayPaymentId = razorpayPaymentId;
    if (razorpaySignature) order.paymentSignature = razorpaySignature;
    order.estimatedDeliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000); // 4 days delivery estimate

    await order.save();

    // Decrement inventory stock
    for (const item of order.items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
      }
      if (item.variantId) {
        await ProductVariant.findByIdAndUpdate(item.variantId, { $inc: { stock: -item.quantity } });
      }
    }

    // Increment coupon count if used
    if (order.couponCode) {
      await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
    }

    // Clear saved cart for user if logged in
    if (order.userId) {
      await User.findByIdAndUpdate(order.userId, { $set: { savedCart: [] } });
    }

    res.json({
      success: true,
      message: "Payment verified successfully. Order confirmed!",
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        items: order.items,
        shippingAddress: order.shippingAddress,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Payment verification failed." });
  }
}

export async function getOrderById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      $or: [
        { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
        { orderNumber: orderId },
      ],
    }).lean();

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    // Authorization check: if order belongs to a registered user, only that user or an admin can access
    if (order.userId) {
      const isOwner = req.user && req.user._id.toString() === order.userId.toString();
      const isAdmin = req.user && req.user.role === "ADMIN";
      if (!isOwner && !isAdmin) {
        res.status(403).json({ success: false, message: "You are not authorized to view this order." });
        return;
      }
    }

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch order." });
  }
}

export async function getMyOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch orders." });
  }
}

export async function cancelOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const { orderId } = req.params;
    const order = await Order.findOne({
      $or: [
        { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
        { orderNumber: orderId },
      ],
    });

    if (!order) {
      res.status(404).json({ success: false, message: "Order not found." });
      return;
    }

    const isOwner = req.user._id.toString() === order.userId?.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      res.status(403).json({ success: false, message: "Unauthorized to cancel this order." });
      return;
    }

    if (["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.orderStatus)) {
      res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in status: ${order.orderStatus}`,
      });
      return;
    }

    order.orderStatus = "CANCELLED";
    await order.save();

    // Restore stock if previously decremented
    if (order.paymentStatus === "PAID") {
      for (const item of order.items) {
        if (item.productId) {
          await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
        }
        if (item.variantId) {
          await ProductVariant.findByIdAndUpdate(item.variantId, { $inc: { stock: item.quantity } });
        }
      }
    }

    res.json({
      success: true,
      message: "Order has been cancelled successfully.",
      order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to cancel order." });
  }
}
