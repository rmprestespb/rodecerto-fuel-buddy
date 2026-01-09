import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Car, Plus, Trash2, Edit2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles, Vehicle } from '@/hooks/useVehicles';
import { toast } from 'sonner';
import { Crown } from 'lucide-react';

const fuelTypes = [
  { value: 'gasoline', label: 'Gasolina' },
  { value: 'ethanol', label: 'Etanol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'gnv', label: 'GNV' }
];

export default function Vehicles() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, canAddVehicle } = useVehicles();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [fuelType, setFuelType] = useState('gasoline');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const resetForm = () => {
    setName('');
    setBrand('');
    setModel('');
    setYear('');
    setLicensePlate('');
    setFuelType('gasoline');
    setEditingVehicle(null);
  };

  const openEditDialog = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setName(vehicle.name);
    setBrand(vehicle.brand || '');
    setModel(vehicle.model || '');
    setYear(vehicle.year?.toString() || '');
    setLicensePlate(vehicle.license_plate || '');
    setFuelType(vehicle.fuel_type);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const vehicleData = {
      name,
      brand: brand || null,
      model: model || null,
      year: year ? parseInt(year) : null,
      license_plate: licensePlate || null,
      fuel_type: fuelType
    };

    if (editingVehicle) {
      const success = await updateVehicle(editingVehicle.id, vehicleData);
      if (success) {
        toast.success('Veículo atualizado!');
        setDialogOpen(false);
        resetForm();
      } else {
        toast.error('Erro ao atualizar veículo');
      }
    } else {
      const vehicle = await addVehicle(vehicleData);
      if (vehicle) {
        toast.success('Veículo adicionado!');
        setDialogOpen(false);
        resetForm();
      } else {
        toast.error('Erro ao adicionar veículo');
      }
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este veículo? Todos os registros serão perdidos.')) {
      const success = await deleteVehicle(id);
      if (success) {
        toast.success('Veículo excluído');
      } else {
        toast.error('Erro ao excluir veículo');
      }
    }
  };

  return (
    <AppLayout hideNav>
      <div className="min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-xl font-bold">Meus Veículos</h1>
        </div>

        {/* Add Vehicle Button */}
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button
              className="w-full mb-6 bg-gradient-primary glow-primary gap-2"
              disabled={!canAddVehicle() && vehicles.length >= 1}
            >
              <Plus size={20} />
              Adicionar veículo
            </Button>
          </DialogTrigger>

          <DialogContent className="glass border-border">
            <DialogHeader>
              <DialogTitle>{editingVehicle ? 'Editar veículo' : 'Novo veículo'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome/Apelido *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Meu Carro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    placeholder="Ex: Fiat"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    placeholder="Ex: Uno"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Ano</Label>
                  <Input
                    id="year"
                    type="number"
                    placeholder="Ex: 2020"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plate">Placa</Label>
                  <Input
                    id="plate"
                    placeholder="Ex: ABC-1234"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Combustível principal</Label>
                <Select value={fuelType} onValueChange={setFuelType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fuelTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary"
                disabled={loading}
              >
                {loading ? 'Salvando...' : editingVehicle ? 'Salvar alterações' : 'Adicionar veículo'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Vehicles List */}
        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-primary/20">
                    <Car className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{vehicle.name}</h3>
                    {vehicle.brand && vehicle.model && (
                      <p className="text-sm text-muted-foreground">
                        {vehicle.brand} {vehicle.model} {vehicle.year && `(${vehicle.year})`}
                      </p>
                    )}
                    {vehicle.license_plate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {vehicle.license_plate}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(vehicle)}
                    className="h-8 w-8"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(vehicle.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pro upgrade prompt */}
        {!profile?.is_pro && vehicles.length >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-2xl border border-secondary/30 bg-secondary/10 text-center"
          >
            <Crown className="mx-auto mb-2 text-secondary" size={24} />
            <p className="text-sm font-medium text-secondary">
              Versão gratuita: 1 veículo
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Faça upgrade para adicionar veículos ilimitados
            </p>
            <Button
              variant="link"
              onClick={() => navigate('/upgrade')}
              className="text-secondary mt-2"
            >
              Ver planos Pro →
            </Button>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
