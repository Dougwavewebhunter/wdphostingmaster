import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.104.1';
import { z } from 'https://esm.sh/zod@3.25.76';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const plans = {
  basic: { name: 'Basic Plan', monthly: 3000, yearly: 28000 },
  business: { name: 'Business Plan', monthly: 5000, yearly: 35000 },
  premium: { name: 'Premium Plan', monthly: 7000, yearly: 45000 },
} as const;

const BodySchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email().max(255),
  customerPhone: z.string().trim().max(40).optional().default(''),
  domainName: z.string().trim().toLowerCase().regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/),
  planId: z.enum(['basic', 'business', 'premium']),
  billingCycle: z.enum(['monthly', 'yearly']),
  notes: z.string().trim().max(1000).optional().default(''),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid order details', details: parsed.error.flatten().fieldErrors }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) throw new Error('Cloud database credentials are not configured');

    const body = parsed.data;
    const plan = plans[body.planId as keyof typeof plans];
    const amountCents = plan[body.billingCycle];
    const paymentReference = `WDP-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const amount = (amountCents / 100).toFixed(2);

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase.from('orders').insert({
      customer_name: body.customerName,
      customer_email: body.customerEmail,
      customer_phone: body.customerPhone || null,
      domain_name: body.domainName,
      plan_id: body.planId,
      plan_name: plan.name,
      billing_cycle: body.billingCycle,
      amount_cents: amountCents,
      currency: 'ZAR',
      payment_provider: 'manual_checkout',
      payment_reference: paymentReference,
      payment_status: 'unpaid',
      status: 'pending',
      admin_notes: body.notes || null,
      payment_payload: {
        provider: 'checkout_provision',
        amount,
        manual_processing: true,
        auto_register_domain: false,
        next_step: 'Connect preferred payment provider. Payment must settle to the site owner before manual activation.',
      },
    }).select('id, payment_reference').single();

    if (error) throw error;

    return new Response(JSON.stringify({
      orderId: data.id,
      paymentReference: data.payment_reference,
      amount,
      currency: 'ZAR',
      checkoutStatus: 'provider_pending',
      message: 'Order created. Checkout provider is not connected yet; domain registration remains manual after owner payment confirmation.',
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
