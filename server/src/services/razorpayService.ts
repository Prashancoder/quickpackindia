import crypto from "crypto";
import Razorpay from "razorpay";

const key_id = process.env.RAZORPAY_KEY_ID || "";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "";

let razorpayInstance: Razorpay | null = null;

export function isRazorpayConfigured(): boolean {
  return (
    Boolean(key_id) &&
    Boolean(key_secret) &&
    !key_id.includes("YourRazorpayKeyId") &&
    !key_secret.includes("YourRazorpayKeySecret")
  );
}

try {
  if (isRazorpayConfigured()) {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }
} catch (error) {
  console.warn("[Razorpay] Failed to initialize Razorpay SDK:", error);
}

export async function createRazorpayOrder(amountInRupees: number, receiptId: string) {
  const amountInPaise = Math.round(amountInRupees * 100);

  if (!isRazorpayConfigured()) {
    throw new Error(
      "Razorpay is not configured. Please add valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file (Sandbox/Test mode starts with rzp_test_)."
    );
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({ key_id, key_secret });
  }

  const order = await razorpayInstance.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: receiptId.slice(0, 40),
    payment_capture: true,
  });

  return {
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
  };
}

export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  if (!isRazorpayConfigured() || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac("sha256", key_secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return generatedSignature === razorpaySignature;
}
