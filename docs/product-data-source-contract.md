# Product Data Source API Contract

Product Command Center is frontend-only on GitHub Pages. The browser must not scrape TikTok Shop, Shopee, Lazada, Kalodata, or marketplace pages directly. When real providers are added, the frontend should call backend/API endpoints that implement the connector contract below.

## Current Status

- Default runtime source: **Local Product Dataset Preview** in `src/app.js`.
- Optional runtime source: **External JSON Database** from a user-provided JSON URL.
- Visible UI label shows either **Data Source: Local Preview Dataset** or **Data Source: External JSON Database**.
- No real marketplace, affiliate, or Kalodata API is connected yet.

## Unified Product Schema

All platform connectors must return products normalized to this schema:

```ts
type NormalizedProduct = {
  id: string;
  platform: 'TikTok' | 'TikTok Shop' | 'Shopee' | 'Lazada';
  title: string;
  image: string;
  price: string;
  commission: string;
  totalSales: string;
  sourceUrl: string;
  rawSource: unknown;
};
```

## External JSON Database Contract

The External JSON Database source is a generic product feed. It may be either:

```json
[
  {
    "id": "external-1",
    "platform": "Shopee",
    "title": "Example Product",
    "image": "https://example.com/product.jpg",
    "price": "฿499",
    "commission": "12%",
    "totalSales": "1.2K",
    "targetTags": ["Trending"],
    "sourceUrl": "https://example.com/product"
  }
]
```

or an object containing a `products`, `items`, or `data` array. Missing optional values are normalized in the frontend preview, but real backend connectors should provide the full unified schema.

If the external JSON fetch fails or has no product array, Product Command Center shows an error and falls back to the Local Product Dataset Preview.

## Connector Functions

Every platform connector must expose the same three operations.

### `searchProducts(platform, target, keyword)`

Searches a backend-owned data source and returns normalized products.

```ts
function searchProducts(
  platform: 'All Platforms' | 'TikTok' | 'Shopee' | 'Lazada',
  target: 'All' | 'High Commission' | 'High Profit' | 'Best Seller' | 'Trending' | 'New Arrival',
  keyword: string,
): NormalizedProduct[];
```

Implementation rule: GitHub Pages must call a backend endpoint such as `/api/products/search`; the browser must not scrape marketplace HTML.

### `importProductByUrl(url)`

Imports one marketplace URL through a backend endpoint and returns one normalized product.

```ts
function importProductByUrl(url: string): NormalizedProduct;
```

Implementation rule: backend validates the URL, detects the platform, calls the appropriate provider connector, then returns normalized product data.

### `normalizeProduct(rawProduct)`

Converts provider-specific product payloads into the unified schema.

```ts
function normalizeProduct(rawProduct: unknown): NormalizedProduct;
```

Implementation rule: preserve the original provider payload in `rawSource` for debugging and future reconciliation.

## Platform Connector Placeholders

### TikTok Shop Connector

- TODO: TikTok Shop data provider integration.
- TODO: Kalodata API integration for TikTok Shop-style discovery when credentials/backend are available.
- Required backend responsibilities: authentication, rate limits, provider error handling, normalization.

### Shopee Connector

- TODO: Shopee affiliate/product API integration.
- TODO: Kalodata API integration for Shopee-style discovery when credentials/backend are available.
- Required backend responsibilities: authentication, partner signatures, rate limits, provider error handling, normalization.

### Lazada Connector

- TODO: Lazada affiliate/product API integration.
- TODO: Kalodata API integration for Lazada-style discovery when credentials/backend are available.
- Required backend responsibilities: authentication, affiliate tracking, rate limits, provider error handling, normalization.
