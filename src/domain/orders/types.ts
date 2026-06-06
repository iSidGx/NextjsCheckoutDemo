export interface DeliveryAddress {
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  postcode: string;
  country: string;
}

export interface PersistedOrderLineItem {
  description: string;
  quantity: number;
  totalAmountMinor: number;
  currency: string;
}

export interface PersistedOrderRecord {
  id: string;
  orderRef: string;
  checkoutSessionId: string;
  paymentStatus: string;
  amountTotalMinor: number;
  currency: string;
  customerEmail: string | null;
  userId: string | null;
  deliveryAddress: DeliveryAddress | null;
  deliveryOptionId: string | null;
  createdAt: string;
  confirmedAt: string;
  lineItems: PersistedOrderLineItem[];
}
