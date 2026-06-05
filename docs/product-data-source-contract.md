# Product Data Source API Contract

Product Command Center is frontend-only on GitHub Pages. The browser must not scrape TikTok Shop, Shopee, Lazada, Kalodata, or marketplace pages directly. When real providers are added, the frontend should call backend/API endpoints that implement the connector contract below.

## Current Status

- Runtime source: **Local Product Dataset Preview** in `src/app.js`.
- Visible UI label: **Data Source: Local Preview Dataset**.
- No real marketplace or Kalodata API is connected yet.

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
