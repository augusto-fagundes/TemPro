import 'dotenv/config';

import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3333),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(8),
});

export const env = envSchema.parse(process.env);
