-- Create oil_changes table
CREATE TABLE public.oil_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  odometer NUMERIC NOT NULL,
  oil_type TEXT NOT NULL CHECK (oil_type IN ('mineral', 'semi_synthetic', 'synthetic')),
  establishment TEXT,
  city TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.oil_changes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own oil changes"
ON public.oil_changes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own oil changes"
ON public.oil_changes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own oil changes"
ON public.oil_changes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own oil changes"
ON public.oil_changes
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_oil_changes_updated_at
BEFORE UPDATE ON public.oil_changes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();