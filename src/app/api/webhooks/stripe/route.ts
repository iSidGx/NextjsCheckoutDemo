import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";
import { upsertOrderRecord } from "@/server/order-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
    }

    const body = await request.text();
    const stripe = getStripeClient();
    const webhookSecret = getStripeWebhookSecret();

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 100,
      });

      await upsertOrderRecord({
        id: `order_${session.id}`,
        checkoutSessionId: session.id,
        paymentStatus: session.payment_status,
        amountTotalMinor: session.amount_total ?? 0,
        currency: session.currency ?? "gbp",
        customerEmail: session.customer_details?.email ?? null,
        deliveryOptionId: session.metadata?.deliveryOptionId ?? null,
        createdAt: new Date(session.created * 1000).toISOString(),
        confirmedAt: new Date().toISOString(),
        lineItems: lineItems.data.map((lineItem) => ({
          description: lineItem.description ?? "Order item",
          quantity: lineItem.quantity ?? 1,
          totalAmountMinor: lineItem.amount_total,
          currency: lineItem.currency,
        })),
      });

      console.info("Stripe checkout completed", {
        checkoutSessionId: session.id,
        amountTotal: session.amount_total,
        currency: session.currency,
        paymentStatus: session.payment_status,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid Stripe webhook event.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
