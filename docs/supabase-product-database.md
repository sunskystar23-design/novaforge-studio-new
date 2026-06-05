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

## How To Enable Supabase Later

1. Open `src/dataSourceConfig.js`.
2. Paste your project URL into `SUPABASE_URL`, for example:
   ```js
   export const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co';
   ```
3. Paste only the public anon key into `SUPABASE_ANON_KEY`:
   ```js
   export const SUPABASE_ANON_KEY = 'YOUR_PUBLIC_ANON_KEY';
   ```
4. Change `USE_SUPABASE` to `true` only after the schema and read policies are ready:
   ```js
   export const USE_SUPABASE = true;
   ```
5. Do not paste the service-role key into frontend code.

## How To Run `supabase/schema.sql`

Choose one of these approaches:

### Supabase SQL Editor

1. Open your Supabase project dashboard.
2. Go to **SQL Editor**.
3. Copy the contents of `supabase/schema.sql`.
4. Paste it into a new SQL query.
5. Run the query.

### Supabase CLI

If your local project is linked to Supabase, run the SQL file with your preferred Supabase/Postgres workflow, for example:

```bash
supabase db push
```

or apply `supabase/schema.sql` through `psql` against your project database.

## Example Sample Products

After the schema is applied, insert sample normalized products with SQL like this:

```sql
insert into public.products (
  platform,
  title,
  image_url,
  price,
  commission,
  total_sales,
  target_tags,
  source_url,
  data_source,
  fetched_at
) values
(
  'TikTok',
  'Wireless Lavalier Mic Pro',
  'https://example.com/images/lavalier-mic.jpg',
  '฿590',
  '18%',
  '12.4K',
  array['High Commission', 'Trending'],
  'https://shop.tiktok.com/view/product/example-1',
  'supabase_sample',
  now()
),
(
  'Shopee',
  'Smart LED Sunset Lamp',
  'https://example.com/images/sunset-lamp.jpg',
  '฿249',
  '12%',
  '48.1K',
  array['Best Seller', 'High Profit'],
  'https://shopee.co.th/product/example-2',
  'supabase_sample',
  now()
),
(
  'Lazada',
  'Portable Mini Blender',
  'https://example.com/images/mini-blender.jpg',
  '฿799',
  '15%',
  '6.8K',
  array['New Arrival', 'High Profit'],
  'https://www.lazada.co.th/products/example-3.html',
  'supabase_sample',
  now()
);
```

## Frontend Runtime Behavior

When `USE_SUPABASE` is `true`, Product Command Center calls the Supabase REST endpoint for the `products` table using the public anon key. Rows are normalized into the existing product schema and filtered by Platform, Target, and Keyword in the frontend.

If Supabase config is missing, placeholder, unavailable, or returns an error, the UI shows a clear error and falls back to the Local Preview Dataset.
