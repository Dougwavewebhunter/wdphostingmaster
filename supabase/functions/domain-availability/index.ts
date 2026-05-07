import { z } from 'https://esm.sh/zod@3.25.76';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BodySchema = z.object({
  domainName: z.string().trim().toLowerCase().regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/),
});

async function checkResellerClub(domainName: string) {
  const authUserId = Deno.env.get('RESELLERCLUB_AUTH_USERID');
  const apiKey = Deno.env.get('RESELLERCLUB_API_KEY');
  const baseUrl = Deno.env.get('RESELLERCLUB_BASE_URL') ?? 'https://httpapi.com';
  if (!authUserId || !apiKey) return null;

  const [sld, ...tldParts] = domainName.split('.');
  const tld = tldParts.join('.');
  const url = `${baseUrl}/api/domains/available.json?auth-userid=${encodeURIComponent(authUserId)}&api-key=${encodeURIComponent(apiKey)}&domain-name=${encodeURIComponent(sld)}&tlds=${encodeURIComponent(tld)}`;
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(`ResellerClub availability check failed [${response.status}]`);
  const key = `${sld}.${tld}`;
  const status = data[key]?.status ?? data[domainName]?.status;
  if (status === 'available') return { available: true, provider: 'ResellerClub', rawStatus: status };
  if (status) return { available: false, provider: 'ResellerClub', rawStatus: status };
  return null;
}

async function checkRdap(domainName: string) {
  const response = await fetch(`https://rdap.org/domain/${encodeURIComponent(domainName)}`, { headers: { accept: 'application/json' } });
  if (response.status === 404) return { available: true, provider: 'RDAP', rawStatus: 'not_found' };
  if (response.ok) return { available: false, provider: 'RDAP', rawStatus: 'registered' };
  throw new Error(`Domain availability lookup failed [${response.status}]`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Enter a valid domain such as example.com' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const resellerClubResult = await checkResellerClub(parsed.data.domainName);
    const result = resellerClubResult ?? await checkRdap(parsed.data.domainName);
    return new Response(JSON.stringify({ domainName: parsed.data.domainName, ...result }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
