import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Wallet, TrendingUp, Sparkles, RefreshCw, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Suggestion {
  type: 'economy' | 'performance' | 'tip';
  title: string;
  description: string;
}

interface FuelSuggestionsProps {
  hasRecords: boolean;
}

const iconMap = {
  economy: Wallet,
  performance: TrendingUp,
  tip: Lightbulb,
};

const colorMap = {
  economy: 'text-emerald-500 bg-emerald-500/10',
  performance: 'text-primary bg-primary/10',
  tip: 'text-amber-500 bg-amber-500/10',
};

export function FuelSuggestions({ hasRecords }: FuelSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Não autenticado');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fuel-suggestions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar sugestões');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar sugestões';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (dismissed) {
    return null;
  }

  if (!hasRecords) {
    return null;
  }

  // Initial state - show prompt to get suggestions
  if (!suggestions && !loading && !error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/5 to-secondary/10"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-secondary/20">
            <Sparkles size={20} className="text-secondary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Sugestões de Economia</p>
            <p className="text-xs text-muted-foreground">
              IA analisa seus registros e sugere economia
            </p>
          </div>
          <Button
            onClick={fetchSuggestions}
            size="sm"
            className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 gap-1"
          >
            <Sparkles size={14} />
            Ver dicas
          </Button>
        </div>
      </motion.div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/5 to-secondary/10"
      >
        <div className="flex items-center justify-center gap-3 py-4">
          <RefreshCw size={20} className="text-secondary animate-spin" />
          <p className="text-sm text-muted-foreground">Analisando seus registros...</p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-2xl border border-destructive/30 bg-destructive/5"
      >
        <div className="flex items-center justify-between">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="ghost" size="sm" onClick={fetchSuggestions}>
            Tentar novamente
          </Button>
        </div>
      </motion.div>
    );
  }

  // Suggestions loaded
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-secondary" />
          <h3 className="font-semibold text-sm">Sugestões de IA</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={fetchSuggestions}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setDismissed(true)}
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {suggestions?.map((suggestion, index) => {
          const Icon = iconMap[suggestion.type] || Lightbulb;
          const colorClass = colorMap[suggestion.type] || colorMap.tip;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground truncate">
                    {suggestion.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {suggestion.description}
                  </p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
