import { z } from 'zod';

// Vehicle validation schema
export const vehicleSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  brand: z.string()
    .trim()
    .max(50, 'Marca deve ter no máximo 50 caracteres')
    .nullable()
    .optional(),
  model: z.string()
    .trim()
    .max(50, 'Modelo deve ter no máximo 50 caracteres')
    .nullable()
    .optional(),
  year: z.number()
    .int('Ano deve ser um número inteiro')
    .min(1900, 'Ano deve ser maior que 1900')
    .max(new Date().getFullYear() + 1, 'Ano inválido')
    .nullable()
    .optional(),
  license_plate: z.string()
    .trim()
    .max(20, 'Placa deve ter no máximo 20 caracteres')
    .nullable()
    .optional(),
  fuel_type: z.string()
    .trim()
    .min(1, 'Tipo de combustível é obrigatório')
    .max(50, 'Tipo de combustível deve ter no máximo 50 caracteres'),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;

// Fuel record validation schema
export const fuelRecordSchema = z.object({
  vehicle_id: z.string().uuid('ID do veículo inválido'),
  station_id: z.string().uuid().nullable().optional(),
  station_name: z.string()
    .trim()
    .max(100, 'Nome do posto deve ter no máximo 100 caracteres')
    .nullable()
    .optional(),
  odometer: z.number()
    .positive('Quilometragem deve ser positiva')
    .max(9999999, 'Quilometragem muito alta'),
  price_per_liter: z.number()
    .positive('Preço deve ser positivo')
    .max(100, 'Preço por litro muito alto'),
  liters: z.number()
    .positive('Litros deve ser positivo')
    .max(500, 'Quantidade de litros muito alta'),
  total_cost: z.number()
    .positive('Custo total deve ser positivo')
    .max(10000, 'Custo total muito alto'),
  fuel_type: z.string()
    .trim()
    .min(1, 'Tipo de combustível é obrigatório')
    .max(50, 'Tipo de combustível deve ter no máximo 50 caracteres'),
  notes: z.string()
    .trim()
    .max(500, 'Notas devem ter no máximo 500 caracteres')
    .nullable()
    .optional(),
  date: z.string().min(1, 'Data é obrigatória'),
});

export type FuelRecordInput = z.infer<typeof fuelRecordSchema>;

// Oil change validation schema
export const oilChangeSchema = z.object({
  vehicle_id: z.string().uuid('ID do veículo inválido'),
  date: z.string().min(1, 'Data é obrigatória'),
  odometer: z.number()
    .positive('Quilometragem deve ser positiva')
    .max(9999999, 'Quilometragem muito alta'),
  oil_type: z.enum(['mineral', 'semi_synthetic', 'synthetic'], {
    errorMap: () => ({ message: 'Tipo de óleo inválido' })
  }),
  establishment: z.string()
    .trim()
    .max(100, 'Nome do estabelecimento deve ter no máximo 100 caracteres')
    .nullable()
    .optional(),
  city: z.string()
    .trim()
    .max(100, 'Nome da cidade deve ter no máximo 100 caracteres')
    .nullable()
    .optional(),
  notes: z.string()
    .trim()
    .max(500, 'Notas devem ter no máximo 500 caracteres')
    .nullable()
    .optional(),
});

export type OilChangeInput = z.infer<typeof oilChangeSchema>;

// Helper function to format validation errors
export function formatValidationError(error: z.ZodError): string {
  return error.errors.map(e => e.message).join(', ');
}

// Auth error message mapping - prevents information leakage
export function getAuthErrorMessage(error: { message?: string; status?: number }): string {
  const message = error.message?.toLowerCase() || '';
  
  // Generic messages to prevent user enumeration
  if (message.includes('invalid login') || 
      message.includes('invalid credentials') ||
      message.includes('email not found') ||
      message.includes('wrong password')) {
    return 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
  }
  
  if (message.includes('user already registered') ||
      message.includes('already exists')) {
    return 'Não foi possível criar a conta. Tente fazer login ou use outro email.';
  }
  
  if (message.includes('email not confirmed')) {
    return 'Por favor, confirme seu email antes de fazer login.';
  }
  
  if (message.includes('too many requests') ||
      message.includes('rate limit')) {
    return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  }
  
  if (message.includes('password') && message.includes('weak')) {
    return 'A senha é muito fraca. Use pelo menos 6 caracteres.';
  }
  
  if (message.includes('network') || message.includes('connection')) {
    return 'Erro de conexão. Verifique sua internet e tente novamente.';
  }
  
  // Generic fallback - never expose internal details
  return 'Ocorreu um erro. Por favor, tente novamente mais tarde.';
}
