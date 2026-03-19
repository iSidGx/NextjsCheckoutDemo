import { NextResponse } from "next/server";
import { z } from "zod";
import { deliveryOptions } from "@/domain/mugs/catalog";
import {
  calculateBasketSummary,
  getDesignById,
  getProductById,
  getSizeById,
} from "@/domain/mugs/pricing";
import { deliveryOptionSchema } from "@/domain/mugs/validation";
import { BasketItem } from "@/domain/mugs/types";
import { getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

const basketItemSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  sizeId: z.enum(["small", "medium", "large"]),
  designId: z.string().min(1),
  quantity: z.number().int().min(1).max(12),
  addedAt: z.string(),
});

const createSessionSchema = z.object({
  items: z.array(basketItemSchema).min(1),
  deliveryOptionId: deliveryOptionSchema,
});

function getAppOrigin(_request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!appUrl) {
    throw new Error("Missing NEXT_PUBLIC_APP_URL environment variable.");
  }

  return appUrl;
}

function toStripeLineItems(items: BasketItem[]) {
  return items.map((item) => {
    const product = getProductById(item.productId);
    const size = getSizeById(item.sizeId);
    const design = getDesignById(item.designId);

    if (!product || !size || !design) {
      throw new Error("Invalid basket item provided for checkout.");
    }

    const unitAmountInPence = (product.basePrice + size.priceDelta + design.priceDelta) * 100;

    return {
      quantity: item.quantity,
      price_data: {
        currency: "gbp",
        unit_amount: unitAmountInPence,
        product_data: {
          name: product.name,
          description: `${design.name} · ${size.label} (${size.capacityOz}oz)`,
          metadata: {
            productId: product.id,
            sizeId: size.id,
            designId: design.id,
          },
        },
      },
    };
  });
}

export async function POST(request: Request) {
  try {
    const payload = createSessionSchema.parse(await request.json());
    const stripe = getStripeClient();
    const origin = getAppOrigin(request);
    const summary = calculateBasketSummary(payload.items, payload.deliveryOptionId);
    const selectedDelivery = deliveryOptions.find(
      (option) => option.id === payload.deliveryOptionId,
    );

    if (!selectedDelivery) {
      return NextResponse.json({ error: "Invalid delivery option." }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        ...toStripeLineItems(payload.items),
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: selectedDelivery.price * 100,
            product_data: {
              name: selectedDelivery.label,
              description: `Estimated delivery: ${selectedDelivery.eta}`,
            },
          },
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=1`,
      metadata: {
        itemCount: String(summary.itemCount),
        subtotal: String(summary.subtotal),
        total: String(summary.total),
        deliveryOptionId: payload.deliveryOptionId,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid payload." }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : "Unable to create checkout session.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
