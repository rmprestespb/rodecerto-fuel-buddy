-- Remove the permissive INSERT policy that allows any authenticated user to create gas stations
DROP POLICY IF EXISTS "Authenticated users can create gas stations" ON public.gas_stations;

-- Gas stations should only be managed by admins/system via service role
-- No INSERT policy means regular users cannot create stations