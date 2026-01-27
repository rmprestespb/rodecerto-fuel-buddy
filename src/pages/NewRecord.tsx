import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Fuel, MapPin, Calendar } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/hooks/useVehicles';
import { useFuelRecords } from '@/hooks/useFuelRecords';
import { toast } from 'sonner';

const fuelTypes = [
  { value: 'gasoline', label: 'Gasolina' },
  { value: 'ethanol', label: 'Etanol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'gnv', label: 'GNV' }
];

export default function NewRecord() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedVehicle, vehicles } = useVehicles();
  const { addRecord } = useFuelRecords(selectedVehicle?.id);

  const [vehicleId, setVehicleId] = useState(selectedVehicle?.id || '');
  const [odometer, setOdometer] = useState('');
  const [pricePerLiter, setPricePerLiter] = useState('');
  const [liters, setLiters] = useState('');
  const [fuelType, setFuelType] = useState('gasoline');
  const [stationName, setStationName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const totalCost = (parseFloat(pricePerLiter) || 0) * (parseFloat(liters) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vehicleId) {
      toast.error('Selecione um veículo');
      return;
    }

    setLoading(true);

    const result = await addRecord({
      vehicle_id: vehicleId,
      odometer: parseFloat(odometer),
      price_per_liter: parseFloat(pricePerLiter),
      liters: parseFloat(liters),
      total_cost: totalCost,
      fuel_type: fuelType,
      station_name: stationName || null,
      station_id: null,
      km_per_liter: null,
      notes: null,
      date: new Date(date).toISOString()
    });

    if (result.error) {
      toast.error('Erro ao registrar abastecimento', { description: result.error });
    } else if (result.data) {
      toast.success('Abastecimento registrado!', {
        description: result.data.km_per_liter ? `Consumo: ${result.data.km_per_liter} km/L` : undefined
      });
      navigate('/dashboard');
    }

    setLoading(false);
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <AppLayout hideNav>
      <div className="min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-xl font-bold">Novo Abastecimento</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label>Veículo</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name} {v.brand && v.model && `- ${v.brand} ${v.model}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fuel Type */}
          <div className="space-y-2">
            <Label>Tipo de combustível</Label>
            <div className="grid grid-cols-4 gap-2">
              {fuelTypes.map((type) => (
                <motion.button
                  key={type.value}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFuelType(type.value)}
                  className={`p-3 rounded-xl border text-center text-sm font-medium transition-all ${
                    fuelType === type.value
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  {type.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Odometer */}
          <div className="space-y-2">
            <Label htmlFor="odometer">Quilometragem atual</Label>
            <div className="relative">
              <Input
                id="odometer"
                type="number"
                placeholder="Ex: 45000"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value)}
                className="pr-12"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                km
              </span>
            </div>
          </div>

          {/* Price and Liters */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço por litro</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="5.99"
                  value={pricePerLiter}
                  onChange={(e) => setPricePerLiter(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="liters">Litros abastecidos</Label>
              <div className="relative">
                <Input
                  id="liters"
                  type="number"
                  step="0.01"
                  placeholder="40"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                  className="pr-8"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  L
                </span>
              </div>
            </div>
          </div>

          {/* Total Cost Display */}
          {totalCost > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-gradient-primary text-center"
            >
              <p className="text-sm text-primary-foreground/80">Total</p>
              <p className="text-3xl font-bold text-primary-foreground">
                R$ {totalCost.toFixed(2)}
              </p>
            </motion.div>
          )}

          {/* Station Name */}
          <div className="space-y-2">
            <Label htmlFor="station">Nome do posto (opcional)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="station"
                type="text"
                placeholder="Ex: Posto Shell Centro"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-primary glow-primary gap-2 h-12"
            disabled={loading}
          >
            <Fuel size={20} />
            {loading ? 'Salvando...' : 'Registrar Abastecimento'}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
