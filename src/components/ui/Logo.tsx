import { motion } from 'framer-motion';
import logoImage from '@/assets/logo-rodecerto.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  showText?: boolean;
  animate?: boolean;
}

export function Logo({ size = 'md', showText = true, animate = false }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 36, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-4xl' },
    xl: { icon: 80, text: 'text-6xl' },
    '2xl': { icon: 100, text: 'text-7xl' },
    '3xl': { icon: 120, text: 'text-8xl' }
  };

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="relative"
        animate={animate ? { scale: [1, 1.05, 1] } : undefined}
        transition={animate ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <motion.div
          className="absolute inset-0 bg-primary/40 blur-lg rounded-full"
          animate={animate ? { opacity: [0.3, 0.7, 0.3] } : { opacity: 0.3 }}
          transition={animate ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
        />
        <img 
          src={logoImage} 
          alt="RodeCerto" 
          style={{ width: sizes[size].icon, height: sizes[size].icon }}
          className="relative object-contain"
        />
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
