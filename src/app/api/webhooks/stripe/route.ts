import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";
import { generateOrderRef, upsertOrderRecord } from "@/server/order-store";
import { getUserByEmail } from "@/server/user-store";
import type { DeliveryAddress } from "@/domain/orders/types";

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

      const customerEmail = session.customer_details?.email ?? null;

      // Prefer the userId stamped into metadata at checkout time.
      // Fall back to email lookup so orders placed without an active session
      // (e.g. link shared, cookie expired) still link to the account.
      let userId: string | null = session.metadata?.userId ?? null;
      if (!userId && customerEmail) {
        const user = await getUserByEmail(customerEmail);
        if (user) userId = user.id;
      }

      const addrName = session.metadata?.addrName;
      const deliveryAddress: DeliveryAddress | null = addrName
        ? {
            name: addrName,
            line1: session.metadata?.addrLine1 ?? "",
            line2: session.metadata?.addrLine2 || null,
            city: session.metadata?.addrCity ?? "",
            postcode: session.metadata?.addrPostcode ?? "",
            country: session.metadata?.addrCountry ?? "GB",
          }
        : null;

      await upsertOrderRecord({
        id: `order_${session.id}`,
        orderRef: generateOrderRef(),
        checkoutSessionId: session.id,
        paymentStatus: session.payment_status,
        amountTotalMinor: session.amount_total ?? 0,
        currency: session.currency ?? "gbp",
        customerEmail,
        userId,
        deliveryAddress,
        deliveryOptionId: session.metadata?.deliveryOptionId ?? null,
        createdAt: new Date(session.created * 1000).toISOString(),
        confirmedAt: new Date().toISOString(),
        lineItems: lineItems.data.map((lineItem) => ({
          description: lineItem.description ?? "Order item",
          quantity: lineItem.quantity ?? 1,
          totalAmountMinor: lineItem.amount_total ?? 0,
          currency: lineItem.currency ?? session.currency ?? "gbp",
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
    console.error("Stripe webhook processing failed", error);
    return NextResponse.json({ error: "Invalid Stripe webhook event." }, { status: 400 });
  }
}
