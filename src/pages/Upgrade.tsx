import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Check, Sparkles, MapPin, Car, BarChart3, History, Download } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const proFeatures = [
  { icon: Car, label: 'Veículos ilimitados', description: 'Cadastre quantos veículos quiser' },
  { icon: History, label: 'Histórico completo', description: 'Todos os seus abastecimentos' },
  { icon: MapPin, label: 'Mapa ilimitado', description: 'Encontre postos sem limites' },
  { icon: BarChart3, label: 'Estatísticas avançadas', description: 'Gráficos e análises detalhadas' },
  { icon: Download, label: 'Exportar relatórios', description: 'Baixe seus dados em PDF/Excel' },
];

export default function Upgrade() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (profile?.is_pro) {
    return (
      <AppLayout hideNav>
        <div className="min-h-screen p-6 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center glow-primary">
              <Crown size={40} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Você já é Pro!</h1>
            <p className="text-muted-foreground mb-6">
              Aproveite todos os benefícios do plano Pro
            </p>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Voltar ao início
            </Button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideNav>
      <div className="min-h-screen p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-xl font-bold">Upgrade Pro</h1>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center glow-primary">
            <Crown size={48} className="text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold mb-2">
            <span className="text-gradient">RodeCerto</span> Pro
          </h2>
          <p className="text-muted-foreground">
            Desbloqueie todo o potencial do app
          </p>
        </motion.div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {proFeatures.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-4 rounded-2xl bg-card border border-border"
            >
              <div className="p-2 rounded-xl bg-primary/20 text-primary shrink-0">
                <feature.icon size={20} />
              </div>
              <div>
                <p className="font-medium">{feature.label}</p>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <Check className="text-primary shrink-0 ml-auto" size={20} />
            </motion.div>
          ))}
        </div>

        {/* Pricing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {/* Monthly */}
          <div className="p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold">Mensal</p>
                <p className="text-sm text-muted-foreground">Cancele quando quiser</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">R$ 9,90</p>
                <p className="text-xs text-muted-foreground">/mês</p>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              Assinar mensal
            </Button>
          </div>

          {/* Annual */}
          <div className="p-6 rounded-2xl border border-primary/50 bg-primary/5 neon-border relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-xl font-medium">
              Economize 40%
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold">Anual</p>
                <p className="text-sm text-muted-foreground">Melhor custo-benefício</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">R$ 5,90</p>
                <p className="text-xs text-muted-foreground">/mês (R$ 70,80/ano)</p>
              </div>
            </div>
            <Button className="w-full bg-gradient-primary glow-primary gap-2">
              <Sparkles size={18} />
              Assinar anual
            </Button>
          </div>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Pagamento seguro via Stripe. Cancele a qualquer momento.
        </p>
      </div>
    </AppLayout>
  );
}
