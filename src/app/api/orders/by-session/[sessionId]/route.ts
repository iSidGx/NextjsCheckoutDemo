import { NextResponse } from "next/server";
import { getOrderRecordByCheckoutSessionId } from "@/server/order-store";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  const params = await context.params;
  const sessionId = decodeURIComponent(params.sessionId);
  const order = await getOrderRecordByCheckoutSessionId(sessionId);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ order });
}
