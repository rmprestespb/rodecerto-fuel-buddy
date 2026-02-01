import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { vehicleSchema, formatValidationError, type VehicleInput } from '@/lib/validations';

export interface Vehicle {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  license_plate: string | null;
  fuel_type: string;
  created_at: string;
  updated_at: string;
}

export function useVehicles() {
  const { user, profile } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const fetchVehicles = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      if (import.meta.env.DEV) console.error('Error fetching vehicles:', error);
      return;
    }

    setVehicles(data as Vehicle[]);
    if (data.length > 0 && !selectedVehicle) {
      setSelectedVehicle(data[0] as Vehicle);
    }
    setLoading(false);
  };

  const canAddVehicle = () => {
    if (!profile) return false;
    if (profile.is_pro) return true;
    return vehicles.length < 1;
  };

  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: Vehicle | null; error: string | null }> => {
    if (!user) return { data: null, error: 'Usuário não autenticado' };
    if (!canAddVehicle()) return { data: null, error: 'Limite de veículos atingido. Faça upgrade para Pro.' };

    // Validate input data
    const validationResult = vehicleSchema.safeParse(vehicle);
    if (!validationResult.success) {
      return { data: null, error: formatValidationError(validationResult.error) };
    }

    const validatedData = validationResult.data;

    const insertData = {
      name: validatedData.name,
      brand: validatedData.brand ?? null,
      model: validatedData.model ?? null,
      year: validatedData.year ?? null,
      license_plate: validatedData.license_plate ?? null,
      fuel_type: validatedData.fuel_type,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('vehicles')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) console.error('Error adding vehicle:', error);
      return { data: null, error: 'Erro ao salvar veículo. Tente novamente.' };
    }

    await fetchVehicles();
    return { data: data as Vehicle, error: null };
  };

  const updateVehicle = async (id: string, updates: Partial<Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<{ success: boolean; error: string | null }> => {
    // Validate partial updates using the same schema
    const validationResult = vehicleSchema.partial().safeParse(updates);
    if (!validationResult.success) {
      return { success: false, error: formatValidationError(validationResult.error) };
    }

    const validatedData = validationResult.data;

    const { error } = await supabase
      .from('vehicles')
      .update(validatedData)
      .eq('id', id);

    if (error) {
      if (import.meta.env.DEV) console.error('Error updating vehicle:', error);
      return { success: false, error: 'Erro ao atualizar veículo. Tente novamente.' };
    }

    await fetchVehicles();
    return { success: true, error: null };
  };

  const deleteVehicle = async (id: string) => {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      if (import.meta.env.DEV) console.error('Error deleting vehicle:', error);
      return false;
    }

    if (selectedVehicle?.id === id) {
      setSelectedVehicle(null);
    }
    await fetchVehicles();
    return true;
  };

  useEffect(() => {
    if (user) {
      fetchVehicles();
    }
  }, [user]);

  return {
    vehicles,
    loading,
    selectedVehicle,
    setSelectedVehicle,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    canAddVehicle,
    refetch: fetchVehicles
  };
}
