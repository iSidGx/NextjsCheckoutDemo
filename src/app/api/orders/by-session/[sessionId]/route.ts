import { NextResponse } from "next/server";
import { getOrderRecordByCheckoutSessionId } from "@/server/order-store";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ sessionId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  let sessionId: string;
  try {
    const params = await context.params;
    sessionId = decodeURIComponent(params.sessionId);
  } catch {
    return NextResponse.json({ error: "Invalid session ID." }, { status: 400 });
  }
  const order = await getOrderRecordByCheckoutSessionId(sessionId);


  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      ...order,
      customerEmail: null,
    },
  });
}
