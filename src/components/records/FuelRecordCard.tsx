import { Fuel, MapPin, Calendar, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { FuelRecord } from '@/hooks/useFuelRecords';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FuelRecordCardProps {
  record: FuelRecord;
  onDelete?: (id: string) => void;
}

const fuelTypeLabels: Record<string, string> = {
  gasoline: 'Gasolina',
  ethanol: 'Etanol',
  diesel: 'Diesel',
  gnv: 'GNV'
};

const fuelTypeColors: Record<string, string> = {
  gasoline: 'bg-amber-500/20 text-amber-400',
  ethanol: 'bg-green-500/20 text-green-400',
  diesel: 'bg-gray-500/20 text-gray-400',
  gnv: 'bg-blue-500/20 text-blue-400'
};

export function FuelRecordCard({ record, onDelete }: FuelRecordCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${fuelTypeColors[record.fuel_type]}`}>
              {fuelTypeLabels[record.fuel_type]}
            </span>
            {record.km_per_liter && (
              <span className="px-2 py-1 rounded-lg text-xs font-medium bg-primary/20 text-primary">
                {record.km_per_liter} km/L
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{format(new Date(record.date), "dd 'de' MMM, yyyy", { locale: ptBR })}</span>
            </div>
            <span className="text-muted-foreground/50">•</span>
            <span className="font-medium text-foreground">{record.odometer.toLocaleString('pt-BR')} km</span>
          </div>

          {record.station_name && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin size={14} />
              <span className="truncate">{record.station_name}</span>
            </div>
          )}

          <div className="flex items-center gap-4 mt-3 text-sm">
            <div>
              <span className="text-muted-foreground">Litros: </span>
              <span className="font-medium">{record.liters.toFixed(2)}L</span>
            </div>
            <div>
              <span className="text-muted-foreground">Preço/L: </span>
              <span className="font-medium">R$ {record.price_per_liter.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-xl font-bold text-primary">
              R$ {record.total_cost.toFixed(2)}
            </p>
          </div>
          
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(record.id)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
