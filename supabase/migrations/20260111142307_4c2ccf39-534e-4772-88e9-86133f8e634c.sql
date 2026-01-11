-- Create function to check if user is pro
CREATE OR REPLACE FUNCTION public.is_user_pro(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_pro FROM public.profiles WHERE user_id = _user_id),
    false
  )
$$;

-- ===========================================
-- VEHICLE LIMIT ENFORCEMENT (1 for free users)
-- ===========================================

CREATE OR REPLACE FUNCTION public.check_vehicle_limit()
RETURNS TRIGGER AS $$
DECLARE
  vehicle_count INT;
  user_is_pro BOOLEAN;
BEGIN
  SELECT public.is_user_pro(NEW.user_id) INTO user_is_pro;
  
  IF user_is_pro THEN
    RETURN NEW;
  END IF;
  
  SELECT COUNT(*) INTO vehicle_count FROM public.vehicles WHERE user_id = NEW.user_id;
  
  IF vehicle_count >= 1 THEN
    RAISE EXCEPTION 'Free users can only have 1 vehicle. Upgrade to Pro for unlimited vehicles.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_vehicle_limit
  BEFORE INSERT ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.check_vehicle_limit();

-- ===========================================
-- OIL CHANGE LIMIT ENFORCEMENT (1 for free users)
-- ===========================================

CREATE OR REPLACE FUNCTION public.check_oil_change_limit()
RETURNS TRIGGER AS $$
DECLARE
  oil_change_count INT;
  user_is_pro BOOLEAN;
BEGIN
  SELECT public.is_user_pro(NEW.user_id) INTO user_is_pro;
  
  IF user_is_pro THEN
    RETURN NEW;
  END IF;
  
  SELECT COUNT(*) INTO oil_change_count FROM public.oil_changes WHERE user_id = NEW.user_id;
  
  IF oil_change_count >= 1 THEN
    RAISE EXCEPTION 'Free users can only have 1 oil change record. Upgrade to Pro for unlimited records.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_oil_change_limit
  BEFORE INSERT ON public.oil_changes
  FOR EACH ROW EXECUTE FUNCTION public.check_oil_change_limit();

-- ===========================================
-- FUEL RECORDS LIMIT ENFORCEMENT (5 for free users)
-- ===========================================

CREATE OR REPLACE FUNCTION public.check_fuel_record_limit()
RETURNS TRIGGER AS $$
DECLARE
  fuel_record_count INT;
  user_is_pro BOOLEAN;
BEGIN
  SELECT public.is_user_pro(NEW.user_id) INTO user_is_pro;
  
  IF user_is_pro THEN
    RETURN NEW;
  END IF;
  
  SELECT COUNT(*) INTO fuel_record_count FROM public.fuel_records WHERE user_id = NEW.user_id;
  
  IF fuel_record_count >= 5 THEN
    RAISE EXCEPTION 'Free users can only have 5 fuel records. Upgrade to Pro for unlimited records.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_fuel_record_limit
  BEFORE INSERT ON public.fuel_records
  FOR EACH ROW EXECUTE FUNCTION public.check_fuel_record_limit();

-- ===========================================
-- MAP USES LIMIT ENFORCEMENT (3 for free users)
-- ===========================================

CREATE OR REPLACE FUNCTION public.check_map_uses_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_is_pro BOOLEAN;
BEGIN
  -- Only check when map_uses_count is being incremented
  IF NEW.map_uses_count > OLD.map_uses_count THEN
    SELECT public.is_user_pro(NEW.user_id) INTO user_is_pro;
    
    IF user_is_pro THEN
      RETURN NEW;
    END IF;
    
    IF NEW.map_uses_count > 3 THEN
      RAISE EXCEPTION 'Free users have a limit of 3 map uses. Upgrade to Pro for unlimited access.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_map_uses_limit
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_map_uses_limit();