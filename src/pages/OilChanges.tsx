import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Droplets, AlertTriangle, CheckCircle, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/hooks/useVehicles';
import { useOilChanges, OIL_TYPE_LABELS } from '@/hooks/useOilChanges';
import { useFuelRecords } from '@/hooks/useFuelRecords';
import { AppLayout } from '@/components/layout/AppLayout';
import { VehicleSelector } from '@/components/dashboard/VehicleSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast';

export default function OilChanges() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const { vehicles, selectedVehicle, setSelectedVehicle, loading: vehiclesLoading, canAddVehicle } = useVehicles();
  const { oilChanges, loading: oilLoading, deleteOilChange, getNextOilChangeKm, getOilChangeStatus, canAddOilChange } = useOilChanges(selectedVehicle?.id);
  const { records } = useFuelRecords(selectedVehicle?.id);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || vehiclesLoading) {
    return (
      <AppLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppLayout>
    );
  }

  // Get latest odometer from fuel records
  const latestOdometer = records.length > 0 ? Number(records[0].odometer) : 0;
  const oilStatus = getOilChangeStatus(latestOdometer, selectedVehicle?.id);

  const handleDelete = async () => {
    if (!deleteId) return;
    
    const success = await deleteOilChange(deleteId);
    if (success) {
      toast({
        title: "Registro excluído",
        description: "A troca de óleo foi removida com sucesso.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o registro.",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  const handleAddClick = () => {
    if (!canAddOilChange()) {
      toast({
        title: "Limite atingido",
        description: "Atualize para PRO para registrar mais trocas de óleo.",
        variant: "destructive",
      });
      navigate('/upgrade');
      return;
    }
    navigate('/new-oil-change');
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="shrink-0"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <Droplets className="text-primary" size={24} />
            <h1 className="text-xl font-bold">Troca de Óleo</h1>
          </div>
          {profile?.is_pro && (
            <Badge variant="secondary" className="ml-auto bg-amber-500/20 text-amber-500">
              PRO
            </Badge>
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
          <Card className="border-dashed">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground mb-2">Adicione um veículo primeiro</p>
              <Button onClick={() => navigate('/vehicles')} size="sm">
                Adicionar Veículo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Oil Status Card */}
        {selectedVehicle && oilStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={`border-l-4 ${
              oilStatus.status === 'overdue' ? 'border-l-destructive bg-destructive/5' :
              oilStatus.status === 'warning' ? 'border-l-amber-500 bg-amber-500/5' :
              'border-l-green-500 bg-green-500/5'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  {oilStatus.status === 'overdue' ? (
                    <AlertTriangle className="text-destructive" size={24} />
                  ) : oilStatus.status === 'warning' ? (
                    <Clock className="text-amber-500" size={24} />
                  ) : (
                    <CheckCircle className="text-green-500" size={24} />
                  )}
                  <div>
                    <p className="font-medium">
                      {oilStatus.status === 'overdue' 
                        ? 'Troca de óleo atrasada!' 
                        : oilStatus.status === 'warning'
                        ? 'Troca de óleo próxima'
                        : 'Óleo em dia'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Próxima troca: {oilStatus.nextKm.toLocaleString('pt-BR')} km
                      {oilStatus.remainingKm > 0 && (
                        <span className="ml-1">
                          (faltam {oilStatus.remainingKm.toLocaleString('pt-BR')} km)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Add Button */}
        <Button 
          onClick={handleAddClick}
          className="w-full gap-2"
        >
          <Plus size={18} />
          Registrar Troca de Óleo
        </Button>

        {/* Free user notice */}
        {!profile?.is_pro && (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-3 text-center text-sm text-muted-foreground">
              Versão gratuita: 1 registro de troca de óleo.{' '}
              <button 
                onClick={() => navigate('/upgrade')}
                className="text-primary underline"
              >
                Atualize para PRO
              </button>
            </CardContent>
          </Card>
        )}

        {/* Oil Changes List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Histórico</h2>
          
          {oilLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : oilChanges.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Droplets className="mx-auto text-muted-foreground mb-2" size={32} />
                <p className="text-muted-foreground">Nenhuma troca registrada</p>
              </CardContent>
            </Card>
          ) : (
            oilChanges.map((oilChange, index) => (
              <motion.div
                key={oilChange.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {OIL_TYPE_LABELS[oilChange.oil_type]}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(oilChange.date), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="font-medium">
                          {Number(oilChange.odometer).toLocaleString('pt-BR')} km
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Próxima: {getNextOilChangeKm(oilChange).toLocaleString('pt-BR')} km
                        </p>
                        {(oilChange.establishment || oilChange.city) && (
                          <p className="text-sm text-muted-foreground">
                            {[oilChange.establishment, oilChange.city].filter(Boolean).join(' • ')}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(oilChange.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
