import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getAuthErrorMessage } from '@/lib/validations';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPassword(email);
    
    if (error) {
      toast.error('Erro ao enviar email', { description: getAuthErrorMessage(error) });
    } else {
      setSent(true);
      toast.success('Email enviado!', { 
        description: 'Verifique sua caixa de entrada para redefinir sua senha.' 
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center gap-3 mb-10">
          <Logo size="3xl" showText={false} />
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">Rode</span>
            <span className="bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400 bg-clip-text text-transparent">Certo</span>
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-3xl p-8"
        >
          <h2 className="text-xl font-semibold text-center mb-2">Recuperar senha</h2>
          <p className="text-muted-foreground text-center text-sm mb-6">
            {sent 
              ? 'Verifique seu email para redefinir sua senha.'
              : 'Digite seu email para receber o link de recuperação.'
            }
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary glow-primary gap-2"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar link'}
                <ArrowRight size={18} />
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2"
                onClick={() => navigate('/auth')}
              >
                <ArrowLeft size={18} />
                Voltar para login
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/10 rounded-xl p-4 text-center">
                <Mail className="mx-auto mb-2 text-primary" size={32} />
                <p className="text-sm">
                  Enviamos um email para <strong>{email}</strong>
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setSent(false)}
              >
                Enviar novamente
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full gap-2"
                onClick={() => navigate('/auth')}
              >
                <ArrowLeft size={18} />
                Voltar para login
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
