import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Fuel, Crown, AlertCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FuelRecordCard } from '@/components/records/FuelRecordCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/hooks/useVehicles';
import { useFuelRecords } from '@/hooks/useFuelRecords';
import { VehicleSelector } from '@/components/dashboard/VehicleSelector';

export default function History() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { vehicles, selectedVehicle, setSelectedVehicle, loading: vehiclesLoading, canAddVehicle } = useVehicles();
  const { records, loading: recordsLoading, deleteRecord } = useFuelRecords(selectedVehicle?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || vehiclesLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Histórico</h1>
          {vehicles.length > 0 && (
            <VehicleSelector
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              onSelect={setSelectedVehicle}
              canAddVehicle={canAddVehicle()}
            />
          )}
        </div>

        {!profile?.is_pro && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl border border-secondary/30 bg-secondary/10"
          >
            <div className="flex items-start gap-3">
              <Crown className="text-secondary shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-secondary">
                  Versão gratuita: últimos 5 registros
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Faça upgrade para ver histórico completo e estatísticas
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => navigate('/upgrade')}
                  className="text-secondary p-0 h-auto mt-2"
                >
                  Ver planos Pro →
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {recordsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : records.length > 0 ? (
          <div className="space-y-3">
            {records.map((record) => (
              <FuelRecordCard key={record.id} record={record} onDelete={deleteRecord} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl border border-border text-center"
          >
            <Fuel className="mx-auto mb-3 text-muted-foreground" size={40} />
            <h3 className="font-semibold mb-2">Nenhum registro</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedVehicle 
                ? 'Comece registrando seu primeiro abastecimento'
                : 'Selecione ou adicione um veículo primeiro'}
            </p>
            <Button onClick={() => navigate(selectedVehicle ? '/new-record' : '/vehicles')} className="bg-gradient-primary">
              {selectedVehicle ? 'Registrar abastecimento' : 'Adicionar veículo'}
            </Button>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
