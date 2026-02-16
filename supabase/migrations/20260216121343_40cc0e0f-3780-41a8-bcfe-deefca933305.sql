
-- Add state and number_of_tyres columns to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS number_of_tyres integer DEFAULT 1;
