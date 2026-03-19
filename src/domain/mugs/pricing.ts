import {
  deliveryOptions,
  mugDesigns,
  mugProducts,
  mugSizes,
} from "./catalog";
import { BasketItem, BasketSummary, DeliveryOptionId, MugConfiguration } from "./types";

export function getProductById(productId: string) {
  return mugProducts.find((product) => product.id === productId);
}

export function getDesignById(designId: string) {
  return mugDesigns.find((design) => design.id === designId);
}

export function getSizeById(sizeId: MugConfiguration["sizeId"]) {
  return mugSizes.find((size) => size.id === sizeId);
}

export function getDeliveryOptionById(deliveryOptionId: DeliveryOptionId) {
  return deliveryOptions.find((option) => option.id === deliveryOptionId);
}

export function calculateUnitPrice(
  productId: string,
  sizeId: MugConfiguration["sizeId"],
  designId: string,
) {
  const product = getProductById(productId);
  const size = getSizeById(sizeId);
  const design = getDesignById(designId);

  if (!product || !size || !design) {
    throw new Error("Invalid pricing input.");
  }

  return product.basePrice + size.priceDelta + design.priceDelta;
}

export function calculateLineSubtotal(item: BasketItem) {
  return calculateUnitPrice(item.productId, item.sizeId, item.designId) * item.quantity;
}

export function calculateBasketSummary(
  items: BasketItem[],
  deliveryOptionId: DeliveryOptionId,
): BasketSummary {
  const delivery = getDeliveryOptionById(deliveryOptionId);

  if (!delivery) {
    throw new Error("Invalid delivery option.");
  }

  const lines = items.map((item) => {
    const product = getProductById(item.productId);
    const design = getDesignById(item.designId);
    const size = getSizeById(item.sizeId);

    if (!product || !design || !size) {
      throw new Error("Cannot summarize basket item.");
    }

    const unitPrice = calculateUnitPrice(item.productId, item.sizeId, item.designId);
    const subtotal = unitPrice * item.quantity;

    return {
      itemId: item.id,
      productName: product.name,
      designName: design.name,
      sizeLabel: `${size.label} · ${size.capacityOz}oz`,
      quantity: item.quantity,
      unitPrice,
      subtotal,
    };
  });

  const subtotal = lines.reduce((total, line) => total + line.subtotal, 0);
  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);

  return {
    items: lines,
    itemCount,
    subtotal,
    deliveryCost: delivery.price,
    total: subtotal + delivery.price,
  };
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}