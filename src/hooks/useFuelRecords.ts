import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { fuelRecordSchema, formatValidationError, type FuelRecordInput } from '@/lib/validations';

export interface FuelRecord {
  id: string;
  user_id: string;
  vehicle_id: string;
  station_id: string | null;
  station_name: string | null;
  odometer: number;
  price_per_liter: number;
  liters: number;
  total_cost: number;
  fuel_type: string;
  km_per_liter: number | null;
  notes: string | null;
  date: string;
  created_at: string;
}

export function useFuelRecords(vehicleId?: string) {
  const { user, profile } = useAuth();
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    if (!user) return;

    let query = supabase
      .from('fuel_records')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId);
    }

    // Limit to 5 records for free users
    if (!profile?.is_pro) {
      query = query.limit(5);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching fuel records:', error);
      return;
    }

    setRecords(data as FuelRecord[]);
    setLoading(false);
  };

  const addRecord = async (record: Omit<FuelRecord, 'id' | 'user_id' | 'created_at'>): Promise<{ data: FuelRecord | null; error: string | null }> => {
    if (!user) return { data: null, error: 'Usuário não autenticado' };

    // Validate input data
    const validationResult = fuelRecordSchema.safeParse(record);
    if (!validationResult.success) {
      return { data: null, error: formatValidationError(validationResult.error) };
    }

    const validatedData = validationResult.data;

    // Calculate km/liter if there's a previous record
    let kmPerLiter = null;
    if (vehicleId) {
      const { data: lastRecord } = await supabase
        .from('fuel_records')
        .select('odometer')
        .eq('vehicle_id', vehicleId)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastRecord) {
        const distance = validatedData.odometer - lastRecord.odometer;
        if (distance > 0 && validatedData.liters > 0) {
          kmPerLiter = Number((distance / validatedData.liters).toFixed(2));
        }
      }
    }

    const insertData = {
      vehicle_id: validatedData.vehicle_id,
      station_id: validatedData.station_id ?? null,
      station_name: validatedData.station_name ?? null,
      odometer: validatedData.odometer,
      price_per_liter: validatedData.price_per_liter,
      liters: validatedData.liters,
      total_cost: validatedData.total_cost,
      fuel_type: validatedData.fuel_type,
      notes: validatedData.notes ?? null,
      date: validatedData.date,
      user_id: user.id,
      km_per_liter: kmPerLiter
    };

    const { data, error } = await supabase
      .from('fuel_records')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error adding fuel record:', error);
      return { data: null, error: 'Erro ao salvar registro. Tente novamente.' };
    }

    await fetchRecords();
    return { data: data as FuelRecord, error: null };
  };

  const deleteRecord = async (id: string) => {
    const { error } = await supabase
      .from('fuel_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting fuel record:', error);
      return false;
    }

    await fetchRecords();
    return true;
  };

  const getStats = () => {
    if (records.length === 0) return null;

    const recordsWithKm = records.filter(r => r.km_per_liter !== null);
    const avgKmPerLiter = recordsWithKm.length > 0
      ? recordsWithKm.reduce((acc, r) => acc + (r.km_per_liter || 0), 0) / recordsWithKm.length
      : null;

    const totalSpent = records.reduce((acc, r) => acc + r.total_cost, 0);
    const totalLiters = records.reduce((acc, r) => acc + r.liters, 0);

    return {
      avgKmPerLiter: avgKmPerLiter ? Number(avgKmPerLiter.toFixed(2)) : null,
      totalSpent: Number(totalSpent.toFixed(2)),
      totalLiters: Number(totalLiters.toFixed(2)),
      recordCount: records.length,
      lastRecord: records[0] || null
    };
  };

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user, vehicleId, profile?.is_pro]);

  return {
    records,
    loading,
    addRecord,
    deleteRecord,
    getStats,
    refetch: fetchRecords
  };
}
