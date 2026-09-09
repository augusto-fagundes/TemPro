import cors from 'cors';
import express from 'express';
import { ZodError } from 'zod';

import { env } from './env';
import { HttpError } from './errors';
import { router } from './routes';

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use('/api', router);

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message, details: err.details });
      return;
    }
    if (err instanceof ZodError) {
      res.status(400).json({
        error: 'Dados inválidos',
        details: err.flatten(),
      });
      return;
    }
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  },
);
