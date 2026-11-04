import { Product } from "../models/Product";
import { ProductVariant } from "../models/ProductVariant";
import { Coupon } from "../models/Coupon";
import { IOrderItem } from "../models/Order";

export interface CalculateOrderInput {
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  couponCode?: string;
  shippingPincode?: string;
}

export interface CalculatedOrderResult {
  verifiedItems: IOrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingCharge: number;
  tax: number; // 18% GST included or calculated
  totalAmount: number;
}

export async function calculateOrderTotals(input: CalculateOrderInput): Promise<CalculatedOrderResult> {
  const verifiedItems: IOrderItem[] = [];
  let subtotal = 0;

  for (const item of input.items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      throw new Error(`Product ${item.productId} is not available or inactive.`);
    }

    let unitPrice = product.basePrice;
    let variantOptions: any = {};
    let sku = product.sku;

    if (item.variantId) {
      const variant = await ProductVariant.findById(item.variantId);
      if (variant && variant.isActive) {
        unitPrice = variant.price;
        variantOptions = variant.options;
        sku = variant.sku;
      }
    }

    const itemSubtotal = Math.round(unitPrice * item.quantity * 100) / 100;
    subtotal += itemSubtotal;

    verifiedItems.push({
      productId: product._id as any,
      variantId: item.variantId ? (item.variantId as any) : undefined,
      productName: product.name,
      sku,
      variantOptions,
      image: product.thumbnail || product.images[0]?.url || "",
      unitPrice,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    });
  }

  // Calculate discount
  let discount = 0;
  let appliedCouponCode: string | undefined = undefined;

  if (input.couponCode) {
    const coupon = await Coupon.findOne({
      code: input.couponCode.trim().toUpperCase(),
      isActive: true,
    });

    if (coupon) {
      const now = new Date();
      if (!coupon.expiryDate || coupon.expiryDate > now) {
        if (subtotal >= (coupon.minimumOrder || 0)) {
          if (coupon.discountType === "PERCENT") {
            discount = (subtotal * coupon.discountValue) / 100;
            if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
              discount = coupon.maximumDiscount;
            }
          } else {
            discount = coupon.discountValue;
          }
          appliedCouponCode = coupon.code;
        }
      }
    }
  }

  discount = Math.min(discount, subtotal);
  const discountedSubtotal = subtotal - discount;

  // Free shipping policy on factory direct packaging
  const shippingCharge = 0;

  // Prices are GST inclusive in modern Indian e-commerce (18% included) or added
  // Tax breakdown (18% GST)
  const tax = Math.round((discountedSubtotal * 0.18) / 1.18 * 100) / 100;
  const totalAmount = Math.round((discountedSubtotal + shippingCharge) * 100) / 100;

  return {
    verifiedItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    couponCode: appliedCouponCode,
    shippingCharge,
    tax,
    totalAmount,
  };
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `QP-${year}-${randomDigits}`;
}
