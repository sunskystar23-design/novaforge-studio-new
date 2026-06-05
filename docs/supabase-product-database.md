# Supabase Product Database Setup

## Purpose

Supabase will become the central **Product Warehouse** for Product Command Center. The current frontend still uses the Local Preview Dataset as a fallback only. No live Supabase connection is enabled yet.

## Future Data Flow

1. TikTok Shop, Shopee, Lazada, and Kalodata product data will be collected by backend/API jobs.
2. Backend jobs will normalize each provider payload into a shared product schema.
3. Normalized records will sync into the Supabase `products` table.
4. Product Command Center will read normalized products from Supabase when the frontend config enables it.
5. If Supabase is unavailable or disabled, the Local Preview Dataset remains the safe fallback.

## Product Table: `products`

| Column | Purpose |
| --- | --- |
| `id` | Stable product UUID. |
| `platform` | Product platform, such as `TikTok`, `Shopee`, or `Lazada`. |
| `title` | Normalized product title. |
| `image_url` | Product image URL. |
| `price` | Display-ready product price. |
| `commission` | Display-ready commission value or rate. |
| `total_sales` | Display-ready total sales metric. |
| `target_tags` | Product target tags, such as `Trending` or `Best Seller`. |
| `source_url` | Canonical product/source URL. |
| `data_source` | Provider/source label, such as `kalodata`, `tiktok_shop`, `shopee_affiliate`, `lazada_affiliate`, or `external_json`. |
| `fetched_at` | Timestamp when the source provider data was fetched. |
| `created_at` | Row creation timestamp. |
| `updated_at` | Row update timestamp. |

## Frontend Config Placeholder

`src/dataSourceConfig.js` defines:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `USE_SUPABASE`

`USE_SUPABASE` is `false` by default. Do not set it to `true` until Supabase credentials, row-level security policies, and backend sync jobs are ready.

## Important Notes

- Do not connect live Supabase from GitHub Pages until the table, policies, and keys are confirmed.
- Do not store service-role keys in the frontend.
- Real TikTok, Shopee, Lazada, and Kalodata integrations should sync through backend jobs or API endpoints first.
- The Local Preview Dataset must remain available as a fallback.
