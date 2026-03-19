import { z } from "zod";
import { mugDesigns, mugSizes, mugProducts, deliveryOptions } from "./catalog";

export const mugConfigurationSchema = z.object({
  productId: z.string().refine(
    (value) => mugProducts.some((product) => product.id === value),
    "Select a valid mug.",
  ),
  sizeId: z.enum(mugSizes.map((size) => size.id) as ["small", "medium", "large"]),
  designId: z.string().refine(
    (value) => mugDesigns.some((design) => design.id === value),
    "Select a valid design.",
  ),
  quantity: z.number().int().min(1).max(12),
});

export const deliveryOptionSchema = z.enum(
  deliveryOptions.map((option) => option.id) as ["standard", "express"],
);

export function validateMugConfiguration(input: unknown) {
  return mugConfigurationSchema.safeParse(input);
}

export function validateDeliveryOption(input: unknown) {
  return deliveryOptionSchema.safeParse(input);
}