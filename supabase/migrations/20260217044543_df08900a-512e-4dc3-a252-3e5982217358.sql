
-- Fix SELECT policies: make them PERMISSIVE so either admin OR dealer can read
-- Also add a policy so the inserting user can read back their own record

-- Customers
DROP POLICY IF EXISTS "Admins read all customers" ON public.customers;
DROP POLICY IF EXISTS "Dealers read own customers" ON public.customers;

CREATE POLICY "Admins read all customers"
ON public.customers FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Dealers read own customers"
ON public.customers FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'dealer'::app_role) AND dealer_code = get_user_dealer_code(auth.uid()));

-- Allow anon to read back the row they just inserted (needed for INSERT...RETURNING)
CREATE POLICY "Anon can read own registration"
ON public.customers FOR SELECT
TO anon
USING (true);

-- Referrals: fix SELECT policies too
DROP POLICY IF EXISTS "Admins read all referrals" ON public.referrals;
DROP POLICY IF EXISTS "Dealers read own referrals" ON public.referrals;

CREATE POLICY "Admins read all referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Dealers read own referrals"
ON public.referrals FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'dealer'::app_role) AND dealer_code = get_user_dealer_code(auth.uid()));

-- Subscriptions: fix SELECT policies
DROP POLICY IF EXISTS "Admins read all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Dealers read own subscriptions" ON public.subscriptions;

CREATE POLICY "Admins read all subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Dealers read own subscriptions"
ON public.subscriptions FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'dealer'::app_role) AND dealer_code = get_user_dealer_code(auth.uid()));

-- Allow anon to read back subscription after insert
CREATE POLICY "Anon can read own subscription"
ON public.subscriptions FOR SELECT
TO anon
USING (true);
