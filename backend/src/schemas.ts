import { z } from 'zod';

import { PRICE_TYPES, PROVIDER_MODES, SERVICE_MODES } from './data/taxonomy';

export const searchQuerySchema = z.object({
  q: z.string().optional().default(''),
  city: z.string().optional(),
  categories: z
    .string()
    .optional()
    .transform((value) =>
      (value ?? '')
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  priceOnly: z
    .union([z.literal('1'), z.literal('true'), z.literal('false'), z.undefined()])
    .transform((value) => value === '1' || value === 'true'),
});

/* Celular as people type it — "(51) 99999-8888" — kept as digits only, the
   same shape `providers.whatsapp` is stored in, so the wa.me hand-off on the
   listing works straight off the number given at sign-up. A landline's 10
   digits are rejected: what is asked for is a celular. */
const mobileSchema = z
  .string()
  .trim()
  .min(1, 'O celular é obrigatório')
  .transform((value) => value.replace(/\D/g, ''))
  .refine(
    (digits) =>
      digits.length === 11 || (digits.length === 13 && digits.startsWith('55')),
    'Informe um celular com DDD — ex.: (51) 99999-8888',
  );

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'O nome é obrigatório'),
  firstName: z.string().trim().min(1, 'O primeiro nome é obrigatório'),
  lastName: z.string().trim().min(1, 'O sobrenome é obrigatório'),
  mobile: mobileSchema,
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
  city: z.string().trim().optional(),
  cities: z.array(z.string().trim().min(1)).optional(),
  category: z.string().trim().optional(),
  /* A listing without at least one service is empty on the public profile —
     registration creates that first row in the same transaction. */
  service: z.object({
    name: z.string().trim().min(1, 'Dê um nome ao serviço para publicá-lo'),
    category: z.string().trim().min(1).optional(),
    description: z.string().default(''),
    mode: z.enum(SERVICE_MODES).default('Em domicílio'),
    priceType: z.enum(PRICE_TYPES).default('Sob consulta'),
    priceAmount: z.string().default(''),
  }),
});

export const citySearchSchema = z.object({
  q: z.string().optional().default(''),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().min(1, 'Informe a senha'),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'O nome é obrigatório'),
  category: z.string().trim().min(1),
  desc: z.string().max(90).default(''),
  about: z.string().default(''),
  city: z.string().trim().min(1),
  cities: z.array(z.string().trim().min(1)).optional().default([]),
  mode: z.enum(PROVIDER_MODES),
  address: z.string().default(''),
  whatsapp: z.string().default(''),
  phone: z.string().default(''),
  instagram: z.string().default(''),
  facebook: z.string().default(''),
  photoUrl: z.string().default(''),
});

export const serviceSchema = z.object({
  name: z.string().trim().min(1, 'Dê um nome ao serviço para publicá-lo'),
  category: z.string().trim().min(1),
  description: z.string().default(''),
  mode: z.enum(SERVICE_MODES),
  priceType: z.enum(PRICE_TYPES),
  priceAmount: z.string().default(''),
});

export const servicePatchSchema = serviceSchema.partial();

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Dê um nome ao produto'),
  category: z.string().trim().min(1),
  description: z.string().default(''),
  priceType: z.enum(PRICE_TYPES),
  priceAmount: z.string().default(''),
  photoUrl: z.string().default(''),
});

export const productPatchSchema = productSchema.partial();
