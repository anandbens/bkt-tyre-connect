
-- Drop restrictive INSERT/UPDATE policies and recreate as permissive
DROP POLICY IF EXISTS "Public can register customers" ON public.customers;
DROP POLICY IF EXISTS "Public can update customers" ON public.customers;

CREATE POLICY "Public can register customers"
ON public.customers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Public can update customers"
ON public.customers
FOR UPDATE
TO anon, authenticated
USING (true);

-- Also fix referrals and subscriptions INSERT policies
DROP POLICY IF EXISTS "Public can create referrals" ON public.referrals;
CREATE POLICY "Public can create referrals"
ON public.referrals
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Public can create subscriptions" ON public.subscriptions;
CREATE POLICY "Public can create subscriptions"
ON public.subscriptions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
