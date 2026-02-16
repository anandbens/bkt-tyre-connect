
-- 1. Create role enum (already exists from partial migration, use IF NOT EXISTS)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'dealer', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create user_roles table FIRST
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  dealer_code text REFERENCES public.dealers(dealer_code),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- 4. Get dealer_code function
CREATE OR REPLACE FUNCTION public.get_user_dealer_code(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result text;
BEGIN
  SELECT dealer_code INTO result FROM public.user_roles
  WHERE user_id = _user_id AND role = 'dealer' LIMIT 1;
  RETURN result;
END;
$$;

-- 5. RLS on user_roles
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 6. Drop old permissive RLS policies
DROP POLICY IF EXISTS "Allow public read on customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public insert on customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public read on dealers" ON public.dealers;
DROP POLICY IF EXISTS "Allow public insert on dealers" ON public.dealers;
DROP POLICY IF EXISTS "Allow public update on dealers" ON public.dealers;
DROP POLICY IF EXISTS "Allow public read on subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow public insert on subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow public update on subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Allow public read on referrals" ON public.referrals;
DROP POLICY IF EXISTS "Allow public insert on referrals" ON public.referrals;

-- 7. CUSTOMERS
CREATE POLICY "Public can register customers" ON public.customers
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update customers" ON public.customers
  FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Admins read all customers" ON public.customers
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Dealers read own customers" ON public.customers
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'dealer') AND dealer_code = public.get_user_dealer_code(auth.uid()));

-- 8. DEALERS
CREATE POLICY "Public can read dealers" ON public.dealers
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert dealers" ON public.dealers
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update dealers" ON public.dealers
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 9. SUBSCRIPTIONS
CREATE POLICY "Public can create subscriptions" ON public.subscriptions
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read all subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Dealers read own subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'dealer') AND dealer_code = public.get_user_dealer_code(auth.uid()));
CREATE POLICY "Admins can update subscriptions" ON public.subscriptions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 10. REFERRALS
CREATE POLICY "Public can create referrals" ON public.referrals
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read all referrals" ON public.referrals
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Dealers read own referrals" ON public.referrals
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'dealer') AND dealer_code = public.get_user_dealer_code(auth.uid()));
