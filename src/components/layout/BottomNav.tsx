import { Home, Plus, MapPin, History, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { icon: Home, label: 'Início', path: '/dashboard' },
  { icon: History, label: 'Histórico', path: '/history' },
  { icon: Plus, label: 'Abastecer', path: '/new-record', isMain: true },
  { icon: MapPin, label: 'Mapa', path: '/map' },
  { icon: User, label: 'Perfil', path: '/profile' }
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 px-2 pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link key={item.path} to={item.path} className="relative -mt-6">
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center glow-primary"
                >
                  <Icon size={28} className="text-primary-foreground" />
                </motion.div>
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 px-3 py-1"
            >
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'p-2 rounded-xl transition-all',
                  isActive ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon size={22} />
              </motion.div>
              <span className={cn(
                'text-xs font-medium',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
