# Real Product Data Source Setup

## Current System

Product Command Center currently uses a local mock product dataset in `src/app.js` as the default fallback. The UI may also load a user-provided External JSON Database, but it does not connect to live marketplace APIs by itself.

## Real Marketplace Data Requirements

Real Shopee, TikTok Shop, and Lazada product data requires a backend/API layer. GitHub Pages is a static frontend host and must not scrape marketplace pages directly from the browser.

A production integration should place credentials, API signatures, rate-limit handling, provider retries, and normalization on a backend service. The frontend should only call approved backend endpoints or load a prepared External JSON Database feed.

## Placeholder Sources

- Kalodata API: not connected.
- TikTok Shop data provider: not connected.
- Shopee product/affiliate API: not connected.
- Lazada product/affiliate API: not connected.
- External JSON database: supported as a user-provided product feed URL.

## Recommended Next Step

Use one of these two paths:

1. Prepare an External JSON Database feed that follows the product schema documented in `docs/product-data-source-contract.md`.
2. Build a backend API that connects to Kalodata or official/approved marketplace provider APIs and returns normalized products to the static frontend.

Do not claim live platform data is connected until one of those backend/API paths is implemented and verified.
