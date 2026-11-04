import {
  createRazorpayOrder,
  verifyPaymentSignature,
  isRazorpayConfigured,
} from "./razorpayService";
import {
  createCashfreeOrderSession,
  verifyCashfreePayment,
  isCashfreeConfigured,
} from "./cashfreeService";

export type PaymentGateway = "RAZORPAY" | "CASHFREE";

export interface InitiatePaymentParams {
  gateway?: PaymentGateway;
  orderId: string;
  orderNumber: string;
  amount: number;
  customer: {
    id?: string;
    name: string;
    email: string;
    phone: string;
  };
  returnUrl?: string;
}

export function getAvailableGateways(): PaymentGateway[] {
  const gateways: PaymentGateway[] = [];
  if (isCashfreeConfigured()) gateways.push("CASHFREE");
  if (isRazorpayConfigured()) gateways.push("RAZORPAY");
  if (gateways.length === 0) gateways.push("CASHFREE");
  return gateways;
}

export function getDefaultGateway(): PaymentGateway {
  const envPreferred = (process.env.ACTIVE_PAYMENT_GATEWAY || "CASHFREE").toUpperCase() as PaymentGateway;
  if (envPreferred === "CASHFREE" && isCashfreeConfigured()) return "CASHFREE";
  if (isCashfreeConfigured()) return "CASHFREE";
  if (envPreferred === "RAZORPAY" && isRazorpayConfigured()) return "RAZORPAY";
  if (isRazorpayConfigured()) return "RAZORPAY";
  return "CASHFREE";
}

export async function initiatePayment(params: InitiatePaymentParams) {
  const chosenGateway = params.gateway || getDefaultGateway();

  if (chosenGateway === "CASHFREE") {
    if (!isCashfreeConfigured()) {
      throw new Error(
        "Cashfree is selected but not configured in .env (CASHFREE_CLIENT_ID / CASHFREE_CLIENT_SECRET)."
      );
    }
    const session = await createCashfreeOrderSession({
      orderId: params.orderNumber || params.orderId,
      orderAmount: params.amount,
      customerDetails: {
        customerId: params.customer.id || params.customer.email,
        customerName: params.customer.name,
        customerEmail: params.customer.email,
        customerPhone: params.customer.phone,
      },
      returnUrl: params.returnUrl,
    });

    return {
      gateway: "CASHFREE" as const,
      paymentSessionId: session.paymentSessionId,
      orderId: session.orderId,
      environment: session.environment,
      amount: params.amount,
      currency: "INR",
    };
  } else {
    // Default to Razorpay
    if (!isRazorpayConfigured()) {
      throw new Error(
        "Razorpay is not configured. Please add valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file."
      );
    }
    const rzpOrder = await createRazorpayOrder(params.amount, params.orderNumber);

    return {
      gateway: "RAZORPAY" as const,
      razorpayOrderId: rzpOrder.id,
      amount: params.amount,
      amountPaise: rzpOrder.amount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }
}

export async function verifyPayment(payload: {
  gateway?: PaymentGateway;
  orderNumber: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}) {
  const gateway = payload.gateway || (payload.razorpayPaymentId ? "RAZORPAY" : "CASHFREE");

  if (gateway === "RAZORPAY") {
    if (!payload.razorpayOrderId || !payload.razorpayPaymentId || !payload.razorpaySignature) {
      throw new Error("Missing Razorpay signature or payment ID for verification.");
    }
    const isValid = verifyPaymentSignature(
      payload.razorpayOrderId,
      payload.razorpayPaymentId,
      payload.razorpaySignature
    );
    return {
      success: isValid,
      gateway: "RAZORPAY",
      paymentId: payload.razorpayPaymentId,
    };
  } else if (gateway === "CASHFREE") {
    const cfResult = await verifyCashfreePayment(payload.orderNumber);
    return {
      success: cfResult.isPaid,
      gateway: "CASHFREE",
      paymentId: cfResult.paymentId,
      details: cfResult.raw,
    };
  }

  throw new Error(`Unsupported payment gateway: ${gateway}`);
}
