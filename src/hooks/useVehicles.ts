import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
      console.error('Error fetching vehicles:', error);
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

  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user || !canAddVehicle()) return null;

    const { data, error } = await supabase
      .from('vehicles')
      .insert({ ...vehicle, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error('Error adding vehicle:', error);
      return null;
    }

    await fetchVehicles();
    return data as Vehicle;
  };

  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    const { error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating vehicle:', error);
      return false;
    }

    await fetchVehicles();
    return true;
  };

  const deleteVehicle = async (id: string) => {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle:', error);
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
