
-- Create complaints table for customer portal
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_number TEXT NOT NULL,
  customer_code TEXT NOT NULL,
  customer_mobile TEXT NOT NULL,
  vehicle_number TEXT,
  service_city TEXT,
  fault_type TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  service_status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Auto-generate complaint number
CREATE SEQUENCE IF NOT EXISTS complaint_number_seq START 30000;

CREATE OR REPLACE FUNCTION public.generate_complaint_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.complaint_number IS NULL OR NEW.complaint_number = '' THEN
    NEW.complaint_number := LPAD(nextval('complaint_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_complaint_number
  BEFORE INSERT ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_complaint_number();

-- Update timestamp trigger
CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON public.complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Anon can create complaints (customer portal uses mobile-based session, no auth)
CREATE POLICY "Public can create complaints"
  ON public.complaints FOR INSERT
  WITH CHECK (true);

-- Anon can read own complaints by mobile
CREATE POLICY "Public can read complaints"
  ON public.complaints FOR SELECT
  USING (true);

-- Anon can update own complaints
CREATE POLICY "Public can update complaints"
  ON public.complaints FOR UPDATE
  USING (true);

-- Insert sample complaint data
INSERT INTO public.complaints (complaint_number, customer_code, customer_mobile, vehicle_number, service_city, fault_type, description, status, service_status, closed_at)
VALUES 
  ('30641', 'CUS78901', '9876543210', 'TSTBKT44526', 'Delhi', 'EMPTY TANK', 'Vehicle ran out of fuel on highway', 'CLOSED', 'COMPLETED', '2026-02-24'),
  ('30642', 'CUS78902', '9876543212', 'MH01CD5678', 'Mumbai', 'FLAT TYRE', 'Flat tyre on Western Express Highway', 'OPEN', 'IN_PROGRESS', NULL),
  ('30643', 'CUS78901', '9876543210', 'TSTBKT44526', 'Pune', 'BRAKE FAILURE', 'Brake issue while driving', 'OPEN', 'PENDING', NULL);
