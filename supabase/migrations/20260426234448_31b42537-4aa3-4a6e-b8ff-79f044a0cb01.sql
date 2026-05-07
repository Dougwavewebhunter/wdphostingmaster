CREATE POLICY "Orders are managed only by secure server functions"
ON public.orders
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);