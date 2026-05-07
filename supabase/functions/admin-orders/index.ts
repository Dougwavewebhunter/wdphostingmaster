import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.104.1';
import { z } from 'https://esm.sh/zod@3.25.76';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UpdateSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(['pending', 'processing', 'active']).optional(),
  paymentStatus: z.enum(['unpaid', 'pending', 'paid', 'failed', 'cancelled']).optional(),
  adminNotes: z.string().trim().max(1000).optional(),
});

function assertAdmin(req: Request) {
  const expected = Deno.env.get('ADMIN_DASHBOARD_TOKEN');
  if (!expected) return;
  const received = req.headers.get('x-admin-token') ?? '';
  if (received !== expected) throw new Error('Admin access denied');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    assertAdmin(req);
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) throw new Error('Cloud database credentials are not configured');
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return new Response(JSON.stringify({ orders: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PATCH') {
      const parsed = UpdateSchema.safeParse(await req.json());
      if (!parsed.success) {
        return new Response(JSON.stringify({ error: 'Invalid order update', details: parsed.error.flatten().fieldErrors }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const update: Record<string, unknown> = {};
      if (parsed.data.status) update.status = parsed.data.status;
      if (parsed.data.paymentStatus) update.payment_status = parsed.data.paymentStatus;
      if (parsed.data.adminNotes !== undefined) update.admin_notes = parsed.data.adminNotes;
      if (parsed.data.status === 'active') update.activated_at = new Date().toISOString();

      const { data, error } = await supabase.from('orders').update(update).eq('id', parsed.data.orderId).select('*').single();
      if (error) throw error;
      return new Response(JSON.stringify({ order: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const status = message === 'Admin access denied' ? 401 : 500;
    return new Response(JSON.stringify({ error: message }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
