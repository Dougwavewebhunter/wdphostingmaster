CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'active');
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'pending', 'paid', 'failed', 'cancelled');

CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL CHECK (char_length(customer_name) BETWEEN 2 AND 120),
  customer_email TEXT NOT NULL CHECK (customer_email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  customer_phone TEXT,
  domain_name TEXT NOT NULL CHECK (domain_name ~* '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$'),
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'ZAR',
  payment_provider TEXT NOT NULL DEFAULT 'payfast',
  payment_reference TEXT NOT NULL UNIQUE,
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  status public.order_status NOT NULL DEFAULT 'pending',
  payment_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  admin_notes TEXT,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX idx_orders_status ON public.orders (status);
CREATE INDEX idx_orders_payment_status ON public.orders (payment_status);
CREATE INDEX idx_orders_domain_name ON public.orders (domain_name);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();