-- Supabase Product Warehouse schema for Product Command Center.
-- This migration prepares the normalized product table only.
-- Live provider sync jobs and frontend Supabase reads are intentionally not enabled yet.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  title text not null,
  image_url text,
  price text,
  commission text,
  total_sales text,
  target_tags text[] not null default '{}',
  source_url text,
  data_source text not null default 'local_preview',
  fetched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_platform_idx on public.products (platform);
create index if not exists products_data_source_idx on public.products (data_source);
create index if not exists products_fetched_at_idx on public.products (fetched_at desc);
create index if not exists products_target_tags_idx on public.products using gin (target_tags);

create or replace function public.set_products_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_products_updated_at();

comment on table public.products is 'Normalized product warehouse for Product Command Center discovery.';
comment on column public.products.data_source is 'Origin of normalized product data, e.g. kalodata, tiktok_shop, shopee_affiliate, lazada_affiliate, external_json, local_preview.';
