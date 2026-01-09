import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Crown, LogOut, Car, Fuel, Settings, ChevronRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/hooks/useVehicles';
import { useFuelRecords } from '@/hooks/useFuelRecords';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { vehicles } = useVehicles();
  const { records } = useFuelRecords();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const menuItems = [
    { icon: Car, label: 'Meus Veículos', path: '/vehicles', value: `${vehicles.length} veículo${vehicles.length !== 1 ? 's' : ''}` },
    { icon: Fuel, label: 'Abastecimentos', path: '/history', value: `${records.length} registro${records.length !== 1 ? 's' : ''}` },
    { icon: Crown, label: 'Plano Pro', path: '/upgrade', value: profile?.is_pro ? 'Ativo' : 'Fazer upgrade', highlight: !profile?.is_pro },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center glow-primary">
            <User size={32} className="text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">
              {profile?.full_name || 'Usuário'}
            </h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {profile?.is_pro && (
              <div className="flex items-center gap-1 mt-1">
                <Crown size={14} className="text-secondary" />
                <span className="text-xs font-medium text-secondary">Plano Pro</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <p className="text-2xl font-bold text-primary">{vehicles.length}</p>
            <p className="text-xs text-muted-foreground">Veículos</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <p className="text-2xl font-bold text-secondary">{records.length}</p>
            <p className="text-xs text-muted-foreground">Registros</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <p className="text-2xl font-bold text-foreground">
              {profile?.is_pro ? '∞' : `${2 - (profile?.map_uses_count || 0)}`}
            </p>
            <p className="text-xs text-muted-foreground">Mapas</p>
          </div>
        </div>

        {/* Pro Upgrade Banner */}
        {!profile?.is_pro && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-gradient-primary glow-primary"
            onClick={() => navigate('/upgrade')}
          >
            <div className="flex items-center gap-3">
              <Crown size={24} className="text-primary-foreground" />
              <div className="flex-1">
                <p className="font-semibold text-primary-foreground">Fazer upgrade para Pro</p>
                <p className="text-xs text-primary-foreground/80">
                  Veículos ilimitados, histórico completo e mais!
                </p>
              </div>
              <ChevronRight size={20} className="text-primary-foreground" />
            </div>
          </motion.div>
        )}

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <motion.div
              key={item.path}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border cursor-pointer hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-muted">
                  <item.icon size={20} className="text-muted-foreground" />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${item.highlight ? 'text-secondary font-medium' : 'text-muted-foreground'}`}>
                  {item.value}
                </span>
                <ChevronRight size={18} className="text-muted-foreground" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut size={18} />
          Sair da conta
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          RodeCerto v1.0.0
        </p>
      </div>
    </AppLayout>
  );
}
