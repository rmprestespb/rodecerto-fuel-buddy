import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calculator, Fuel, Droplet, CheckCircle, XCircle } from 'lucide-react';

import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function FuelCalculator() {
  const navigate = useNavigate();
  const [gasolinePrice, setGasolinePrice] = useState('');
  const [ethanolPrice, setEthanolPrice] = useState('');

  const result = useMemo(() => {
    const gasoline = parseFloat(gasolinePrice.replace(',', '.'));
    const ethanol = parseFloat(ethanolPrice.replace(',', '.'));

    if (!gasoline || !ethanol || gasoline <= 0 || ethanol <= 0) {
      return null;
    }

    const ratio = ethanol / gasoline;
    const percentDiff = ((1 - ratio) * 100).toFixed(1);
    const isEthanolBetter = ratio < 0.7;

    return {
      ratio: ratio.toFixed(2),
      percentDiff,
      isEthanolBetter,
      recommendation: isEthanolBetter ? 'ethanol' : 'gasoline',
    };
  }, [gasolinePrice, ethanolPrice]);

  return (
    <AppLayout>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-2">
            <Calculator className="text-primary" size={24} />
            <h1 className="text-xl font-bold">Calculadora</h1>
          </div>
        </div>

        {/* Explanation */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="p-4 text-sm text-muted-foreground">
            <p>
              <strong>Regra dos 70%:</strong> Se o preço do etanol for menor que 70% do preço da gasolina, 
              vale a pena abastecer com etanol.
            </p>
          </CardContent>
        </Card>

        {/* Input Fields */}
        <div className="space-y-4">
          {/* Gasoline Price */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <Label htmlFor="gasoline" className="flex items-center gap-2">
              <Fuel size={16} className="text-amber-500" />
              Preço da Gasolina (R$/L)
            </Label>
            <Input
              id="gasoline"
              type="text"
              inputMode="decimal"
              placeholder="Ex: 5,99"
              value={gasolinePrice}
              onChange={(e) => setGasolinePrice(e.target.value)}
              className="text-lg h-12"
            />
          </motion.div>

          {/* Ethanol Price */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="ethanol" className="flex items-center gap-2">
              <Droplet size={16} className="text-green-500" />
              Preço do Etanol (R$/L)
            </Label>
            <Input
              id="ethanol"
              type="text"
              inputMode="decimal"
              placeholder="Ex: 3,89"
              value={ethanolPrice}
              onChange={(e) => setEthanolPrice(e.target.value)}
              className="text-lg h-12"
            />
          </motion.div>
        </div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Recommendation Card */}
            <Card className={`border-2 ${
              result.isEthanolBetter 
                ? 'border-green-500 bg-green-500/10' 
                : 'border-amber-500 bg-amber-500/10'
            }`}>
              <CardContent className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    result.isEthanolBetter ? 'bg-green-500' : 'bg-amber-500'
                  }`}
                >
                  {result.isEthanolBetter ? (
                    <Droplet size={32} className="text-white" />
                  ) : (
                    <Fuel size={32} className="text-white" />
                  )}
                </motion.div>
                
                <h2 className={`text-2xl font-bold mb-2 ${
                  result.isEthanolBetter ? 'text-green-500' : 'text-amber-500'
                }`}>
                  Abasteça com {result.isEthanolBetter ? 'Etanol' : 'Gasolina'}!
                </h2>
                
                <p className="text-muted-foreground">
                  O {result.isEthanolBetter ? 'etanol' : 'gasolina'} está mais vantajoso
                </p>
              </CardContent>
            </Card>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{(parseFloat(result.ratio) * 100).toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Etanol / Gasolina</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-secondary">70%</p>
                  <p className="text-xs text-muted-foreground">Ponto de equilíbrio</p>
                </CardContent>
              </Card>
            </div>

            {/* Comparison */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fuel size={18} className="text-amber-500" />
                    <span>Gasolina</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!result.isEthanolBetter ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <XCircle size={18} className="text-muted-foreground" />
                    )}
                    <span className="font-mono">R$ {parseFloat(gasolinePrice.replace(',', '.')).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplet size={18} className="text-green-500" />
                    <span>Etanol</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.isEthanolBetter ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <XCircle size={18} className="text-muted-foreground" />
                    )}
                    <span className="font-mono">R$ {parseFloat(ethanolPrice.replace(',', '.')).toFixed(2)}</span>
                  </div>
                </div>

                {/* Visual Bar */}
                <div className="pt-2">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(parseFloat(result.ratio) * 100, 100)}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full rounded-full ${
                        result.isEthanolBetter ? 'bg-green-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>0%</span>
                    <span className="text-primary font-medium">70%</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {!result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center text-muted-foreground"
          >
            <Calculator size={48} className="mx-auto mb-4 opacity-50" />
            <p>Digite os preços acima para ver a recomendação</p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
