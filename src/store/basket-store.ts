import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { deliveryOptions } from "@/domain/mugs/catalog";
import {
  BasketItem,
  DeliveryOptionId,
  MugConfiguration,
} from "@/domain/mugs/types";
import {
  validateDeliveryOption,
  validateMugConfiguration,
} from "@/domain/mugs/validation";

interface BasketState {
  items: BasketItem[];
  deliveryOptionId: DeliveryOptionId;
  addItem: (productId: string, configuration: MugConfiguration) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  selectDeliveryOption: (deliveryOptionId: DeliveryOptionId) => void;
  clearBasket: () => void;
}

const defaultDeliveryOptionId = deliveryOptions[0].id;

const noopStorage: Storage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
  clear: () => undefined,
  key: () => null,
  get length() {
    return 0;
  },
};

function getPersistStorage() {
  if (typeof window === "undefined") {
    return noopStorage;
  }

  const storage = window.localStorage;

  if (
    storage &&
    typeof storage.getItem === "function" &&
    typeof storage.setItem === "function" &&
    typeof storage.removeItem === "function"
  ) {
    return storage;
  }

  return noopStorage;
}

function createBasketItemId(productId: string, sizeId: string, designId: string) {
  return `${productId}:${sizeId}:${designId}`;
}

export const useBasketStore = create<BasketState>()(
  persist(
    (set) => ({
      items: [],
      deliveryOptionId: defaultDeliveryOptionId,
      addItem: (productId, configuration) => {
        const result = validateMugConfiguration({ productId, ...configuration });

        if (!result.success) {
          throw new Error(result.error.issues[0]?.message ?? "Invalid mug configuration.");
        }

        const itemId = createBasketItemId(
          productId,
          configuration.sizeId,
          configuration.designId,
        );

        set((state) => {
          const existingItem = state.items.find((item) => item.id === itemId);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === itemId
                  ? { ...item, quantity: Math.min(item.quantity + configuration.quantity, 12) }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id: itemId,
                productId,
                sizeId: configuration.sizeId,
                designId: configuration.designId,
                quantity: configuration.quantity,
                addedAt: new Date().toISOString(),
              },
            ],
          };
        });
      },
      updateQuantity: (itemId, quantity) => {
        if (!Number.isInteger(quantity) || quantity < 1) {
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: Math.min(quantity, 12) } : item,
          ),
        }));
      },
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },
      selectDeliveryOption: (deliveryOptionId) => {
        const result = validateDeliveryOption(deliveryOptionId);

        if (!result.success) {
          throw new Error("Invalid delivery option.");
        }

        set({ deliveryOptionId });
      },
      clearBasket: () => {
        set({ items: [], deliveryOptionId: defaultDeliveryOptionId });
      },
    }),
    {
      name: "mug-atelier-basket",
      version: 1,
      storage: createJSONStorage(getPersistStorage),
      partialize: (state) => ({
        items: state.items,
        deliveryOptionId: state.deliveryOptionId,
      }),
    },
  ),
);