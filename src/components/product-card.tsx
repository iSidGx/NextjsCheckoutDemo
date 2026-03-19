"use client";

import { useState } from "react";
import { defaultMugConfiguration, mugDesigns, mugSizes } from "@/domain/mugs/catalog";
import { calculateUnitPrice, formatCurrency } from "@/domain/mugs/pricing";
import { validateMugConfiguration } from "@/domain/mugs/validation";
import { MugProduct } from "@/domain/mugs/types";
import { useBasketStore } from "@/store/basket-store";
import { MugPreview } from "./mug-preview";
import { QuantityStepper } from "./quantity-stepper";

interface ProductCardProps {
  product: MugProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useBasketStore((state) => state.addItem);
  const [sizeId, setSizeId] = useState(defaultMugConfiguration.sizeId);
  const [designId, setDesignId] = useState(defaultMugConfiguration.designId);
  const [quantity, setQuantity] = useState(defaultMugConfiguration.quantity);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedSize = mugSizes.find((size) => size.id === sizeId) ?? mugSizes[0];
  const selectedDesign =
    mugDesigns.find((design) => design.id === designId) ?? mugDesigns[0];
  const unitPrice = calculateUnitPrice(product.id, sizeId, designId);

  function handleAddToBasket() {
    const result = validateMugConfiguration({
      productId: product.id,
      sizeId,
      designId,
      quantity,
    });

    if (!result.success) {
      setStatusMessage(result.error.issues[0]?.message ?? "Please review your mug options.");
      return;
    }

    addItem(product.id, { sizeId, designId, quantity });
    setStatusMessage(`Added ${quantity} ${product.name} to your basket.`);
  }

  return (
    <article className="grid gap-6 rounded-[2rem] border border-stone-200/70 bg-white/90 p-6 shadow-[0_30px_90px_-50px_rgba(28,25,23,0.55)] backdrop-blur lg:grid-cols-[1.05fr_1fr]">
      <MugPreview product={product} design={selectedDesign} size={selectedSize} />

      <div className="flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">
              {product.material} · {product.finish}
            </p>
            <h2 className="mt-3 text-3xl text-stone-900">{product.name}</h2>
          </div>
          <div className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">
            {formatCurrency(unitPrice)}
          </div>
        </div>

        <p className="mt-4 text-sm leading-7 text-stone-600">{product.description}</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <fieldset>
            <legend className="text-sm font-semibold text-stone-800">Size</legend>
            <div className="mt-3 grid gap-2">
              {mugSizes.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setSizeId(size.id)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    size.id === sizeId
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-400"
                  }`}
                >
                  <span className="block text-sm font-semibold">{size.label}</span>
                  <span className="block text-xs opacity-80">{size.capacityOz}oz</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-stone-800">Design</legend>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {mugDesigns.map((design) => (
                <button
                  key={design.id}
                  type="button"
                  onClick={() => setDesignId(design.id)}
                  className={`rounded-2xl border px-3 py-3 text-left transition ${
                    design.id === designId
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                  }`}
                >
                  <span
                    className="mb-2 block h-2.5 w-16 rounded-full"
                    style={{ backgroundColor: design.accentColor }}
                  />
                  <span className="block text-sm font-semibold">{design.name}</span>
                  <span className="block text-xs opacity-80">
                    {design.priceDelta > 0 ? `+${formatCurrency(design.priceDelta)}` : "Included"}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-stone-200 bg-stone-50 px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-stone-800">Quantity</p>
            <p className="mt-1 text-xs text-stone-500">Choose between 1 and 12 mugs.</p>
          </div>
          <QuantityStepper id={`quantity-${product.id}`} value={quantity} onChange={setQuantity} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm leading-6 text-stone-600">
            Search tags: {product.tags.join(" · ")}
          </p>
          <button
            type="button"
            onClick={handleAddToBasket}
            className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            Add to basket
          </button>
        </div>

        <p className="mt-4 min-h-6 text-sm text-stone-600" aria-live="polite">
          {statusMessage}
        </p>
      </div>
    </article>
  );
}