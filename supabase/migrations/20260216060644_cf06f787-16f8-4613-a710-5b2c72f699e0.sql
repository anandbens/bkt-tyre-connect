
-- Dealers table
CREATE TABLE public.dealers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_code TEXT NOT NULL UNIQUE,
  dealer_name TEXT NOT NULL,
  dealer_mobile_number TEXT NOT NULL,
  dealer_email TEXT,
  dealer_city TEXT,
  dealer_state TEXT,
  dealer_address_line1 TEXT,
  dealer_address_line2 TEXT,
  dealer_pincode TEXT,
  dealer_gstin TEXT,
  dealer_status TEXT NOT NULL DEFAULT 'ACTIVE',
  dealer_channel_type TEXT DEFAULT 'Authorized BKT Dealer',
  dealer_enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customers table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  vehicle_make_model TEXT,
  tyre_details TEXT,
  invoice_number TEXT,
  dealer_code TEXT NOT NULL REFERENCES public.dealers(dealer_code),
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE,
  customer_code TEXT NOT NULL REFERENCES public.customers(customer_code),
  customer_name TEXT NOT NULL,
  customer_mobile TEXT,
  dealer_code TEXT NOT NULL REFERENCES public.dealers(dealer_code),
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_price NUMERIC NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'PENDING',
  payment_transaction_id TEXT,
  subscription_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subscription_end_date DATE NOT NULL,
  order_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Referral details table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dealer_code TEXT NOT NULL REFERENCES public.dealers(dealer_code),
  customer_code TEXT NOT NULL REFERENCES public.customers(customer_code),
  referral_source TEXT NOT NULL DEFAULT 'Dealer QR',
  referral_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(dealer_code, customer_code)
);

-- Enable RLS on all tables
ALTER TABLE public.dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Public read policies (this is a B2B app where data is accessed via dealer/admin login, not user auth)
CREATE POLICY "Allow public read on dealers" ON public.dealers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on dealers" ON public.dealers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on dealers" ON public.dealers FOR UPDATE USING (true);

CREATE POLICY "Allow public read on customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert on customers" ON public.customers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on subscriptions" ON public.subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on subscriptions" ON public.subscriptions FOR UPDATE USING (true);

CREATE POLICY "Allow public read on referrals" ON public.referrals FOR SELECT USING (true);
CREATE POLICY "Allow public insert on referrals" ON public.referrals FOR INSERT WITH CHECK (true);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_dealers_updated_at BEFORE UPDATE ON public.dealers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate customer code
CREATE OR REPLACE FUNCTION public.generate_customer_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_code IS NULL OR NEW.customer_code = '' THEN
    NEW.customer_code := 'CUS' || LPAD(nextval('customer_code_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE SEQUENCE IF NOT EXISTS customer_code_seq START WITH 10000;
CREATE TRIGGER auto_customer_code BEFORE INSERT ON public.customers FOR EACH ROW EXECUTE FUNCTION public.generate_customer_code();

-- Auto-generate order ID
CREATE OR REPLACE FUNCTION public.generate_order_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_id IS NULL OR NEW.order_id = '' THEN
    NEW.order_id := 'ORD' || LPAD(nextval('order_id_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE SEQUENCE IF NOT EXISTS order_id_seq START WITH 50000;
CREATE TRIGGER auto_order_id BEFORE INSERT ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.generate_order_id();

-- Seed initial data
INSERT INTO public.dealers (dealer_code, dealer_name, dealer_mobile_number, dealer_email, dealer_city, dealer_state, dealer_status, dealer_enrollment_date)
VALUES 
  ('DLR12345', 'Sharma Tyres', '9876543211', 'sharmatyres@gmail.com', 'Pune', 'Maharashtra', 'ACTIVE', '2026-01-15'),
  ('DLR12346', 'Delhi Auto Works', '9876543214', 'delhiauto@gmail.com', 'Delhi', 'Delhi', 'ACTIVE', '2026-02-01');

INSERT INTO public.customers (customer_code, customer_name, mobile_number, email, city, vehicle_number, vehicle_make_model, tyre_details, invoice_number, dealer_code, registration_date)
VALUES
  ('CUS78901', 'Ravi Kumar', '9876543210', 'ravi@gmail.com', 'Pune', 'MH12AB1234', 'Tata Ace', 'BKT Agrimax RT657', 'INV2345', 'DLR12345', '2026-02-10'),
  ('CUS78902', 'Suresh Patel', '9876543212', 'suresh@gmail.com', 'Mumbai', 'MH01CD5678', 'Mahindra Bolero', 'BKT AT171', 'INV2346', 'DLR12345', '2026-02-11'),
  ('CUS78903', 'Anjali Sharma', '9876543213', 'anjali@gmail.com', 'Delhi', 'DL08EF9012', 'Ashok Leyland Dost', 'BKT Earthmax SR41', 'INV2347', 'DLR12346', '2026-02-12');

INSERT INTO public.subscriptions (order_id, customer_code, customer_name, customer_mobile, dealer_code, plan_id, plan_name, plan_price, payment_status, subscription_start_date, subscription_end_date, order_timestamp)
VALUES
  ('ORD45678', 'CUS78901', 'Ravi Kumar', '9876543210', 'DLR12345', 'PLAN_GOLD', 'Gold Assistance Plan', 1499, 'SUCCESS', '2026-02-10', '2027-02-09', '2026-02-10T11:15:00Z'),
  ('ORD45679', 'CUS78902', 'Suresh Patel', '9876543212', 'DLR12345', 'PLAN_SILVER', 'Silver Assistance Plan', 799, 'SUCCESS', '2026-02-11', '2026-08-10', '2026-02-11T14:30:00Z');

INSERT INTO public.referrals (dealer_code, customer_code) VALUES ('DLR12345', 'CUS78901'), ('DLR12345', 'CUS78902'), ('DLR12346', 'CUS78903');
