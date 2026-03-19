export interface PersistedOrderLineItem {
  description: string;
  quantity: number;
  totalAmountMinor: number;
  currency: string;
}

export interface PersistedOrderRecord {
  id: string;
  checkoutSessionId: string;
  paymentStatus: string;
  amountTotalMinor: number;
  currency: string;
  customerEmail: string | null;
  deliveryOptionId: string | null;
  createdAt: string;
  confirmedAt: string;
  lineItems: PersistedOrderLineItem[];
}
