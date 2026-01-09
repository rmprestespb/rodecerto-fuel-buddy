import { Fuel } from 'lucide-react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animate?: boolean;
}

export function Logo({ size = 'md', showText = true, animate = false }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 28, text: 'text-2xl' },
    lg: { icon: 40, text: 'text-4xl' },
    xl: { icon: 64, text: 'text-6xl' }
  };

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="relative"
        animate={animate ? { scale: [1, 1.1, 1] } : undefined}
        transition={animate ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <motion.div
          className="absolute inset-0 bg-primary/40 blur-lg rounded-full"
          animate={animate ? { opacity: [0.3, 0.8, 0.3] } : { opacity: 0.3 }}
          transition={animate ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
        />
        <div className="relative p-2 rounded-xl bg-gradient-primary">
          <Fuel size={sizes[size].icon} className="text-primary-foreground" />
        </div>
      </motion.div>
      {showText && (
        <h1 className={`font-bold tracking-tight ${sizes[size].text}`}>
          <span className="text-gradient">Rode</span>
          <span className="text-foreground">Certo</span>
        </h1>
      )}
    </div>
  );
}
