import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Fuel, TrendingUp, Wallet, Plus, Crown, AlertCircle, Droplets, AlertTriangle, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { VehicleSelector } from '@/components/dashboard/VehicleSelector';
import { FuelRecordCard } from '@/components/records/FuelRecordCard';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/hooks/useVehicles';
import { useFuelRecords } from '@/hooks/useFuelRecords';
import { useOilChanges } from '@/hooks/useOilChanges';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { vehicles, selectedVehicle, setSelectedVehicle, loading: vehiclesLoading, canAddVehicle } = useVehicles();
  const { records, loading: recordsLoading, getStats, deleteRecord } = useFuelRecords(selectedVehicle?.id);
  const { getOilChangeStatus, getLatestOilChange } = useOilChanges(selectedVehicle?.id);
  
  const stats = getStats();
  
  // Get latest odometer from fuel records for oil change status
  const latestOdometer = records.length > 0 ? Number(records[0].odometer) : 0;
  const oilStatus = getOilChangeStatus(latestOdometer, selectedVehicle?.id);
  const latestOilChange = getLatestOilChange(selectedVehicle?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || vehiclesLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-12 w-48" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-32" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          {profile?.is_pro && (
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-xs font-semibold">
              <Crown size={14} />
              PRO
            </div>
          )}
        </div>

        {/* Vehicle Selector */}
        {vehicles.length > 0 ? (
          <VehicleSelector
            vehicles={vehicles}
            selectedVehicle={selectedVehicle}
            onSelect={setSelectedVehicle}
            canAddVehicle={canAddVehicle()}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl neon-border bg-card text-center"
          >
            <AlertCircle className="mx-auto mb-3 text-primary" size={32} />
            <h3 className="font-semibold mb-2">Nenhum veículo cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione seu veículo para começar a registrar abastecimentos
            </p>
            <Button onClick={() => navigate('/vehicles')} className="bg-gradient-primary glow-primary gap-2">
              <Plus size={18} />
              Adicionar veículo
            </Button>
          </motion.div>
        )}

        {/* Oil Change Alert */}
        {selectedVehicle && oilStatus && (oilStatus.status === 'warning' || oilStatus.status === 'overdue') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border-l-4 cursor-pointer transition-all hover:scale-[1.02] ${
              oilStatus.status === 'overdue' 
                ? 'border-l-destructive bg-destructive/10 border-destructive/30' 
                : 'border-l-amber-500 bg-amber-500/10 border-amber-500/30'
            }`}
            onClick={() => navigate('/oil-changes')}
          >
            <div className="flex items-center gap-3">
              {oilStatus.status === 'overdue' ? (
                <div className="p-2 rounded-xl bg-destructive/20">
                  <AlertTriangle size={20} className="text-destructive" />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-amber-500/20">
                  <Clock size={20} className="text-amber-500" />
                </div>
              )}
              <div className="flex-1">
                <p className={`font-semibold ${oilStatus.status === 'overdue' ? 'text-destructive' : 'text-amber-500'}`}>
                  {oilStatus.status === 'overdue' ? 'Troca de óleo atrasada!' : 'Troca de óleo próxima'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {oilStatus.status === 'overdue' 
                    ? `Deveria trocar em ${oilStatus.nextKm.toLocaleString('pt-BR')} km`
                    : `Faltam ${oilStatus.remainingKm.toLocaleString('pt-BR')} km para a próxima troca`
                  }
                </p>
              </div>
              <Droplets size={18} className={oilStatus.status === 'overdue' ? 'text-destructive' : 'text-amber-500'} />
            </div>
          </motion.div>
        )}

        {selectedVehicle && (
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              icon={<TrendingUp size={20} />}
              label="Consumo médio"
              value={stats?.avgKmPerLiter ? `${stats.avgKmPerLiter}` : '--'}
              subtitle="km/litro"
              variant="primary"
            />
            <StatCard
              icon={<Wallet size={20} />}
              label="Total gasto"
              value={stats?.totalSpent ? `R$ ${stats.totalSpent.toFixed(0)}` : 'R$ 0'}
              subtitle={`${stats?.totalLiters?.toFixed(0) || 0} litros`}
              variant="secondary"
            />
          </div>
        )}

        {/* Quick Action */}
        {selectedVehicle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-gradient-primary glow-primary"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary-foreground/20">
                  <Fuel size={24} className="text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-primary-foreground">Registrar abastecimento</p>
                  <p className="text-xs text-primary-foreground/80">Atualize seu consumo</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/new-record')}
                variant="secondary"
                size="icon"
                className="rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <Plus size={20} />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Recent Records */}
        {selectedVehicle && records.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Últimos abastecimentos</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate('/history')} className="text-primary">
                Ver todos
              </Button>
            </div>
            <div className="space-y-3">
              {records.slice(0, 3).map((record) => (
                <FuelRecordCard key={record.id} record={record} onDelete={deleteRecord} />
              ))}
            </div>
            
            {!profile?.is_pro && (
              <div className="p-4 rounded-2xl border border-secondary/30 bg-secondary/10 text-center">
                <Crown className="mx-auto mb-2 text-secondary" size={24} />
                <p className="text-sm text-secondary font-medium">
                  Versão gratuita: últimos 5 registros
                </p>
                <Button variant="link" onClick={() => navigate('/upgrade')} className="text-secondary">
                  Fazer upgrade para histórico ilimitado
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {selectedVehicle && records.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl border border-border text-center"
          >
            <Fuel className="mx-auto mb-3 text-muted-foreground" size={40} />
            <h3 className="font-semibold mb-2">Nenhum registro ainda</h3>
            <p className="text-sm text-muted-foreground">
              Registre seu primeiro abastecimento para começar a acompanhar o consumo
            </p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
