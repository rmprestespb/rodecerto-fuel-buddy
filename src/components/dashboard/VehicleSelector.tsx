import { ChevronDown, Car, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Vehicle } from '@/hooks/useVehicles';
import { useNavigate } from 'react-router-dom';

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onSelect: (vehicle: Vehicle) => void;
  canAddVehicle: boolean;
}

export function VehicleSelector({ 
  vehicles, 
  selectedVehicle, 
  onSelect,
  canAddVehicle 
}: VehicleSelectorProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 glass border-border/50">
          <Car size={18} className="text-primary" />
          <span className="max-w-32 truncate">
            {selectedVehicle?.name || 'Selecionar veículo'}
          </span>
          <ChevronDown size={16} className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 glass">
        {vehicles.map((vehicle) => (
          <DropdownMenuItem
            key={vehicle.id}
            onClick={() => onSelect(vehicle)}
            className="gap-2"
          >
            <Car size={16} />
            <span>{vehicle.name}</span>
            {vehicle.brand && vehicle.model && (
              <span className="text-xs text-muted-foreground ml-auto">
                {vehicle.brand} {vehicle.model}
              </span>
            )}
          </DropdownMenuItem>
        ))}
        {vehicles.length > 0 && <DropdownMenuSeparator />}
        <DropdownMenuItem
          onClick={() => navigate('/vehicles')}
          className="gap-2"
          disabled={!canAddVehicle && vehicles.length >= 1}
        >
          <Plus size={16} className="text-primary" />
          <span>{canAddVehicle ? 'Adicionar veículo' : 'Versão Pro - mais veículos'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
