export type MugSizeId = "small" | "medium" | "large";

export type DeliveryOptionId = "standard" | "express";

export interface MugSize {
  id: MugSizeId;
  label: string;
  capacityOz: number;
  priceDelta: number;
}

export interface MugDesign {
  id: string;
  name: string;
  accentColor: string;
  text: string;
  priceDelta: number;
}

export interface MugProduct {
  id: string;
  name: string;
  description: string;
  material: string;
  finish: string;
  basePrice: number;
  tags: string[];
  palette: {
    body: string;
    rim: string;
    handle: string;
    surface: string;
  };
}

export interface DeliveryOption {
  id: DeliveryOptionId;
  label: string;
  eta: string;
  price: number;
}

export interface MugConfiguration {
  sizeId: MugSizeId;
  designId: string;
  quantity: number;
}

export interface BasketItem {
  id: string;
  productId: string;
  sizeId: MugSizeId;
  designId: string;
  quantity: number;
  addedAt: string;
}

export interface BasketSummaryLine {
  itemId: string;
  productName: string;
  designName: string;
  sizeLabel: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface BasketSummary {
  items: BasketSummaryLine[];
  itemCount: number;
  subtotal: number;
  deliveryCost: number;
  total: number;
}