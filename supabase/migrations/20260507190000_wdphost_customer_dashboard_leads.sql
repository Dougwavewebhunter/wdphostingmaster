-- WDP Host customer dashboard, service requests and lead capture tables
-- Run in Supabase SQL Editor only if you want Supabase-powered account requests before WHMCS is connected.

create table if not exists public.wdphost_service_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text,
  customer_email text,
  customer_phone text,
  service_needed text,
  preferred_contact text,
  best_call_time text,
  meeting_preference text,
  message text,
  status text not null default 'new'
);

create table if not exists public.wdphost_customer_products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete cascade,
  product_name text not null,
  product_type text not null default 'hosting',
  domain_name text,
  billing_status text not null default 'pending',
  renewal_date date,
  control_panel_url text,
  whmcs_client_id text,
  notes text
);

alter table public.wdphost_service_requests enable row level security;
alter table public.wdphost_customer_products enable row level security;

do $$ begin
  create policy "Anyone can create WDP Host service requests" on public.wdphost_service_requests for insert with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can view own WDP Host products" on public.wdphost_customer_products for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
