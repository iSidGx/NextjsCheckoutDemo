# Mug Atelier Demo

Next.js App Router demo for a customizable mug storefront with a product catalog, persisted basket, Stripe test checkout, webhook confirmation, and persisted order records.

## Features

- Searchable mug catalog with seeded products.
- Product customization (size, design, quantity) with live mug preview.
- Basket management with persisted client state via Zustand.
- Checkout flow backed by Stripe Checkout (test mode).
- Webhook-confirmed order persistence to a lightweight JSON store.
- Success page that loads and displays the confirmed order record.
- Unit and component tests with Vitest + Testing Library.

## Tech stack

- Next.js 16 (App Router)
- TypeScript (strict mode)
- Tailwind CSS 4
- Zustand
- Zod
- Stripe Node SDK
- Vitest + Testing Library

## Prerequisites

- Node.js 20+
- npm 10+
- Stripe account (test mode keys)
- Stripe CLI (for local webhook forwarding)

Install Stripe CLI on macOS (Homebrew):

```bash
brew install stripe/stripe-cli/stripe
```

Login once:

```bash
stripe login
```

## Setup

1) Install dependencies:

```bash
npm install
```

2) Create local environment file:

```bash
cp .env.example .env.local
```

3) Fill `.env.local` values:

- `NEXT_PUBLIC_APP_URL`: app base URL (local: `http://localhost:3000`)
- `STRIPE_SECRET_KEY`: Stripe test secret key (`sk_test_...`)
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret (`whsec_...`)

Optional:

- `ORDER_STORE_FILE`: absolute path for JSON order store file (default: `data/orders.json`)

## Run locally

Start the Next.js app:

```bash
npm run dev
```

In a second terminal, start Stripe webhook forwarding:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed `whsec_...` value into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

Open the app:

- `http://localhost:3000`

## Stripe test checkout flow

1) Add items to basket and go to checkout.
2) Click `Pay securely (test mode)`.
3) Complete payment in Stripe Checkout.
4) Stripe redirects to `/checkout/success?session_id=...`.
5) Webhook `checkout.session.completed` persists an order record.
6) Success page fetches order details from `/api/orders/by-session/[sessionId]`.

Test card example:

- Number: `4242 4242 4242 4242`
- Expiry: any future date
- CVC: any 3 digits
- Postcode: any valid value

If payment is canceled, Stripe returns to `/checkout?canceled=1` and basket contents remain unchanged.

## Order persistence

- Store implementation: `src/server/order-store.ts`
- Default file: `data/orders.json`
- Write path: `POST /api/webhooks/stripe` on `checkout.session.completed`
- Read path: `GET /api/orders/by-session/[sessionId]`

## Available scripts

- `npm run dev` — start local dev server
- `npm run build` — create production build
- `npm run start` — start production server
- `npm run lint` — run ESLint
- `npm run test` — run tests once
- `npm run test:watch` — run tests in watch mode

## Quality checks

Run locally:

```bash
npm run lint
npm run test
npm run build
```

## Project structure

- `src/app` — routes and API handlers
- `src/components` — UI components
- `src/domain/mugs` — catalog, pricing, search, validation, types
- `src/domain/orders` — persisted order types
- `src/server` — server-side JSON order store
- `src/store` — client basket store

## Troubleshooting

- `Missing STRIPE_SECRET_KEY environment variable.`
	- Set `STRIPE_SECRET_KEY` in `.env.local` and restart dev server.

- `Missing STRIPE_WEBHOOK_SECRET environment variable.`
	- Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and copy the emitted `whsec_...` into `.env.local`, then restart.

- Success page shows syncing warning.
	- Wait a few seconds and refresh; webhook delivery can arrive slightly after redirect.