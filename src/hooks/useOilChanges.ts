import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OilChange {
  id: string;
  user_id: string;
  vehicle_id: string;
  date: string;
  odometer: number;
  oil_type: 'mineral' | 'semi_synthetic' | 'synthetic';
  establishment: string | null;
  city: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const OIL_TYPE_KM_INTERVALS = {
  mineral: 5000,
  semi_synthetic: 7500,
  synthetic: 10000,
};

export const OIL_TYPE_LABELS = {
  mineral: 'Mineral',
  semi_synthetic: 'Semissintético',
  synthetic: 'Sintético',
};

export function useOilChanges(vehicleId?: string) {
  const { user, profile } = useAuth();
  const [oilChanges, setOilChanges] = useState<OilChange[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOilChanges = async () => {
    if (!user) return;
    
    setLoading(true);
    let query = supabase
      .from('oil_changes')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching oil changes:', error);
    } else {
      setOilChanges((data || []) as OilChange[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOilChanges();
  }, [user, vehicleId]);

  const addOilChange = async (
    oilChange: Omit<OilChange, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('oil_changes')
      .insert({
        ...oilChange,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding oil change:', error);
      return null;
    }

    await fetchOilChanges();
    return data as OilChange;
  };

  const deleteOilChange = async (id: string) => {
    const { error } = await supabase
      .from('oil_changes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting oil change:', error);
      return false;
    }

    await fetchOilChanges();
    return true;
  };

  const getNextOilChangeKm = (oilChange: OilChange): number => {
    const interval = OIL_TYPE_KM_INTERVALS[oilChange.oil_type];
    return oilChange.odometer + interval;
  };

  const getLatestOilChange = (vehicleIdFilter?: string): OilChange | null => {
    const filtered = vehicleIdFilter 
      ? oilChanges.filter(oc => oc.vehicle_id === vehicleIdFilter)
      : oilChanges;
    return filtered.length > 0 ? filtered[0] : null;
  };

  const canAddOilChange = (): boolean => {
    if (!profile) return false;
    if (profile.is_pro) return true;
    // Free users get 1 free oil change record
    return oilChanges.length < 1;
  };

  const getOilChangeStatus = (currentOdometer: number, vehicleIdFilter?: string): {
    status: 'ok' | 'warning' | 'overdue';
    nextKm: number;
    remainingKm: number;
  } | null => {
    const latest = getLatestOilChange(vehicleIdFilter);
    if (!latest) return null;

    const nextKm = getNextOilChangeKm(latest);
    const remainingKm = nextKm - currentOdometer;

    let status: 'ok' | 'warning' | 'overdue' = 'ok';
    if (remainingKm <= 0) {
      status = 'overdue';
    } else if (remainingKm <= 500) {
      status = 'warning';
    }

    return { status, nextKm, remainingKm };
  };

  return {
    oilChanges,
    loading,
    addOilChange,
    deleteOilChange,
    getNextOilChangeKm,
    getLatestOilChange,
    canAddOilChange,
    getOilChangeStatus,
    refetch: fetchOilChanges,
  };
}
