import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: 'default' | 'primary' | 'secondary';
  className?: string;
}

export function StatCard({ 
  icon, 
  label, 
  value, 
  subtitle, 
  variant = 'default',
  className 
}: StatCardProps) {
  const variants = {
    default: 'bg-card border-border',
    primary: 'bg-primary/10 border-primary/30 neon-border',
    secondary: 'bg-secondary/10 border-secondary/30'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'p-4 rounded-2xl border',
        variants[variant],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'p-2 rounded-xl',
          variant === 'primary' ? 'bg-primary/20 text-primary' : 
          variant === 'secondary' ? 'bg-secondary/20 text-secondary' :
          'bg-muted text-muted-foreground'
        )}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className={cn(
            'text-2xl font-bold truncate',
            variant === 'primary' ? 'text-primary' :
            variant === 'secondary' ? 'text-secondary' :
            'text-foreground'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
