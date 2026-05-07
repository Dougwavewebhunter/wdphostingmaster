# WDP Host — GitHub to Netlify PWA

This project is prepared for GitHub → Netlify deployment.

## Netlify settings
- Build command: `npm run build`
- Publish directory: `dist`
- Base directory: leave blank

## Required Netlify environment variables
Add these in Netlify → Site settings → Environment variables:

- `VITE_SUPABASE_URL` = Supabase Project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` = Supabase anon/public/publishable key
- `VITE_SUPABASE_PROJECT_ID` = Supabase project reference ID
- `VITE_WHATSAPP_NUMBER` = 27812159792
- `VITE_WHMCS_URL` = your WHMCS billing URL later, e.g. https://wdphost.com/billing

## WHMCS/DirectAdmin next steps
When your reseller account is online, connect:
1. WHMCS billing portal
2. DirectAdmin server module
3. Registrar/domain API
4. PayFast or preferred payment gateway
5. Client area links from WDP Host website to WHMCS

## Supabase migration
Optional pre-WHMCS dashboard tables are in:
`supabase/migrations/20260507190000_wdphost_customer_dashboard_leads.sql`
