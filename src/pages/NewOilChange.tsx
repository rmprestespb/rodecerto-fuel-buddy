import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets } from 'lucide-react';
import { format } from 'date-fns';

import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/hooks/useVehicles';
import { useOilChanges, OIL_TYPE_LABELS } from '@/hooks/useOilChanges';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

const oilTypes = [
  { value: 'mineral', label: 'Mineral', interval: '5.000 km' },
  { value: 'semi_synthetic', label: 'Semissintético', interval: '7.500 km' },
  { value: 'synthetic', label: 'Sintético', interval: '10.000 km' },
] as const;

export default function NewOilChange() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { vehicles, loading: vehiclesLoading } = useVehicles();
  const { addOilChange, canAddOilChange } = useOilChanges();

  const [vehicleId, setVehicleId] = useState('');
  const [oilType, setOilType] = useState<'mineral' | 'semi_synthetic' | 'synthetic'>('synthetic');
  const [odometer, setOdometer] = useState('');
  const [establishment, setEstablishment] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (vehicles.length > 0 && !vehicleId) {
      setVehicleId(vehicles[0].id);
    }
  }, [vehicles, vehicleId]);

  useEffect(() => {
    if (!canAddOilChange()) {
      toast({
        title: "Limite atingido",
        description: "Atualize para PRO para registrar mais trocas de óleo.",
        variant: "destructive",
      });
      navigate('/upgrade');
    }
  }, [canAddOilChange, navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicleId || !odometer || !oilType) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o veículo, quilometragem e tipo de óleo.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const result = await addOilChange({
      vehicle_id: vehicleId,
      odometer: parseFloat(odometer),
      oil_type: oilType,
      establishment: establishment || null,
      city: city || null,
      date: new Date(date).toISOString(),
      notes: notes || null,
    });

    setIsSubmitting(false);

    if (result.error) {
      toast({
        title: "Erro",
        description: result.error,
        variant: "destructive",
      });
    } else if (result.data) {
      toast({
        title: "Registro salvo!",
        description: "Troca de óleo registrada com sucesso.",
      });
      navigate('/oil-changes');
    }
  };

  const selectedOilInfo = oilTypes.find(o => o.value === oilType);

  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/oil-changes')}
            className="shrink-0"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <Droplets className="text-primary" size={24} />
            <h1 className="text-xl font-bold">Nova Troca de Óleo</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label htmlFor="vehicle">Veículo *</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger id="vehicle">
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} - {vehicle.brand} {vehicle.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Oil Type */}
          <div className="space-y-2">
            <Label htmlFor="oilType">Tipo de Óleo *</Label>
            <Select value={oilType} onValueChange={(v) => setOilType(v as typeof oilType)}>
              <SelectTrigger id="oilType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {oilTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label} (próxima em {type.interval})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Oil Type Info */}
          {selectedOilInfo && (
            <Card className="bg-muted/50">
              <CardContent className="p-3 text-sm">
                <p className="text-muted-foreground">
                  Próxima troca será após <strong>{selectedOilInfo.interval}</strong> rodados
                </p>
              </CardContent>
            </Card>
          )}

          {/* Odometer */}
          <div className="space-y-2">
            <Label htmlFor="odometer">Quilometragem atual *</Label>
            <Input
              id="odometer"
              type="number"
              placeholder="Ex: 45000"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Data da troca</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Establishment */}
          <div className="space-y-2">
            <Label htmlFor="establishment">Estabelecimento</Label>
            <Input
              id="establishment"
              placeholder="Ex: Auto Center Silva"
              value={establishment}
              onChange={(e) => setEstablishment(e.target.value)}
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              placeholder="Ex: São Paulo"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Ex: Trocou filtro também..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Troca de Óleo'}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
