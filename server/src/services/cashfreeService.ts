import crypto from "crypto";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export interface CashfreeConfig {
  clientId: string;
  clientSecret: string;
  env: "SANDBOX" | "PRODUCTION";
  baseUrl: string;
}

// Function to safely reload .env from disk on runtime
function reloadEnvFromFile() {
  try {
    const candidates = [
      path.resolve(process.cwd(), ".env"),
      path.resolve(__dirname, "../../.env"),
      path.resolve(__dirname, "../../../.env"),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        const fileContent = fs.readFileSync(candidate, "utf8");
        const parsed = dotenv.parse(fileContent);
        for (const [key, value] of Object.entries(parsed)) {
          if (value && (!process.env[key] || process.env[key] !== value)) {
            process.env[key] = value;
          }
        }
        break;
      }
    }
  } catch {
    // Continue with existing process.env
  }
}

export function getCashfreeConfig(): CashfreeConfig {
  // Always ensure freshest values from .env file
  reloadEnvFromFile();

  const clientId = (
    process.env.CASHFREE_APP_ID ||
    process.env.CASHFREE_CLIENT_ID ||
    ""
  ).trim();

  const clientSecret = (
    process.env.CASHFREE_SECRET_KEY ||
    process.env.CASHFREE_CLIENT_SECRET ||
    ""
  ).trim();

  const rawEnv = (
    process.env.CASHFREE_ENVIRONMENT ||
    process.env.CASHFREE_ENV ||
    ""
  ).toUpperCase();

  // If secret contains _prod_, or rawEnv is PRODUCTION/LIVE, route to Cashfree Production PG
  const isProduction =
    rawEnv === "PRODUCTION" ||
    rawEnv === "LIVE" ||
    (rawEnv === "" && clientSecret.includes("_prod_"));

  const env: "SANDBOX" | "PRODUCTION" = isProduction ? "PRODUCTION" : "SANDBOX";
  const baseUrl = isProduction
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

  return { clientId, clientSecret, env, baseUrl };
}

export interface CreateCashfreeOrderPayload {
  orderId: string;
  orderAmount: number;
  orderCurrency?: string;
  customerDetails: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  returnUrl?: string;
  notifyUrl?: string;
}

export function isCashfreeConfigured(): boolean {
  const { clientId, clientSecret } = getCashfreeConfig();
  return (
    Boolean(clientId) &&
    Boolean(clientSecret) &&
    !clientId.includes("YourCashfree") &&
    !clientId.includes("replace_with")
  );
}

export async function createCashfreeOrderSession(payload: CreateCashfreeOrderPayload) {
  const config = getCashfreeConfig();

  if (!isCashfreeConfigured()) {
    throw new Error(
      "Cashfree is not configured. Please set CASHFREE_APP_ID and CASHFREE_SECRET_KEY in environment variables."
    );
  }

  const siteUrl = process.env.CLIENT_URL || process.env.VITE_SITE_URL || "http://localhost:8081";
  let returnUrl = payload.returnUrl
    ? payload.returnUrl.replace("{order_id}", payload.orderId)
    : `${siteUrl}/orders/${payload.orderId}?cf_id={order_id}`;

  // Cashfree Production mode requires HTTPS in return_url
  if (config.env === "PRODUCTION" && returnUrl.startsWith("http://")) {
    const prodDomain = process.env.VITE_PROD_URL || "https://quickpack.in";
    returnUrl = returnUrl.replace(/^http:\/\/localhost(:\d+)?/, prodDomain);
    if (returnUrl.startsWith("http://")) {
      returnUrl = returnUrl.replace(/^http:\/\//, "https://");
    }
  }

  const cleanCustomerId = (
    payload.customerDetails.customerId
      ? payload.customerDetails.customerId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50)
      : `cust_${Date.now()}`
  ) || `cust_${Date.now()}`;

  const cleanPhone =
    (payload.customerDetails.customerPhone || "9871002637")
      .replace(/[^0-9]/g, "")
      .slice(-10) || "9871002637";

  const requestBody = {
    order_id: payload.orderId,
    order_amount: Math.round(payload.orderAmount * 100) / 100,
    order_currency: payload.orderCurrency || "INR",
    customer_details: {
      customer_id: cleanCustomerId,
      customer_name: (payload.customerDetails.customerName || "Customer").slice(0, 100),
      customer_email: payload.customerDetails.customerEmail || "customer@quickpack.in",
      customer_phone: cleanPhone.length === 10 ? cleanPhone : "9871002637",
    },
    order_meta: {
      return_url: returnUrl,
      notify_url: payload.notifyUrl,
    },
  };

  const response = await fetch(`${config.baseUrl}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": config.clientId,
      "x-client-secret": config.clientSecret,
      "x-api-version": "2023-08-01",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg =
      data.message ||
      (data.errors && JSON.stringify(data.errors)) ||
      `Cashfree API error status ${response.status}`;
    throw new Error(errorMsg);
  }

  return {
    orderId: data.order_id,
    paymentSessionId: data.payment_session_id,
    orderStatus: data.order_status,
    environment: config.env,
  };
}

export async function verifyCashfreePayment(orderId: string) {
  const config = getCashfreeConfig();

  if (!isCashfreeConfigured()) {
    throw new Error("Cashfree is not configured.");
  }

  const response = await fetch(`${config.baseUrl}/orders/${orderId}/payments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": config.clientId,
      "x-client-secret": config.clientSecret,
      "x-api-version": "2023-08-01",
    },
  });

  const payments = await response.json();

  if (!response.ok) {
    throw new Error(payments.message || "Failed to fetch payments from Cashfree");
  }

  if (Array.isArray(payments) && payments.length > 0) {
    const successfulPayment = payments.find((p: any) => p.payment_status === "SUCCESS");
    if (successfulPayment) {
      return {
        isPaid: true,
        paymentId: successfulPayment.cf_payment_id?.toString() || successfulPayment.payment_id,
        paymentMethod: successfulPayment.payment_group,
        paymentTime: successfulPayment.payment_completion_time,
        raw: successfulPayment,
      };
    }
  }

  return { isPaid: false };
}

export function verifyCashfreeWebhookSignature(
  rawBody: string,
  signature: string,
  timestamp: string
): boolean {
  const { clientSecret } = getCashfreeConfig();
  if (!clientSecret || !signature || !timestamp) {
    return false;
  }

  const data = timestamp + rawBody;
  const generatedSignature = crypto
    .createHmac("sha256", clientSecret)
    .update(data)
    .digest("base64");

  return generatedSignature === signature;
}
