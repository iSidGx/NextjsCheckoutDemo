# Mug Atelier Demo

Next.js App Router demo for a retailer selling customizable mugs with live design previews, a persisted basket, delivery selection, and a checkout confirmation flow.

## Features

- Searchable mug catalog with four seeded products.
- Customization per product with three mug sizes, predefined designs, and quantity selection.
- Live mug preview that updates as the selected design and size change.
- Basket flow with persisted state, quantity updates, item removal, and delivery selection.
- Checkout summary and confirmation route for the demo order flow.
- Unit and component tests covering pricing, search, store behavior, and catalog interaction.

## Stack

- Next.js 16 App Router
- TypeScript with strict mode
- Tailwind CSS 4
- Zustand for basket state persistence
- Zod for validation
- Vitest and Testing Library

## Project structure

- `src/app`: route entry points for catalog, basket, checkout, and confirmation.
- `src/components`: client-facing UI for catalog, basket, preview, and shared controls.
- `src/domain/mugs`: seeded catalog data, domain types, pricing, search, and validation logic.
- `src/store`: persisted basket store.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run test`

## Quality checks

The current implementation passes:

- `npm run build`
- `npm run lint`
- `npm run test`