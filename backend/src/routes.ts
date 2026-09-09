import { Router, type Request } from 'express';
import { z } from 'zod';

import { authOf, requireAuth } from './auth';
import { DEFAULT_CITY } from './data/taxonomy';
import { HttpError } from './errors';
import { searchCities } from './cities';
import {
  citySearchSchema,
  loginSchema,
  productPatchSchema,
  productSchema,
  profileSchema,
  registerSchema,
  searchQuerySchema,
  servicePatchSchema,
  serviceSchema,
} from './schemas';
import * as store from './store';
import { loginUser, registerUser } from './users';

export const router = Router();

function routeParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw new HttpError(400, 'Parâmetro inválido');
  }
  return value;
}

router.get('/health', (_req, res) => {
  res.json({ ok: true, name: 'tempro' });
});

router.post('/auth/register', async (req, res) => {
  const body = registerSchema.parse(req.body);
  res.status(201).json(await registerUser(body));
});

router.post('/auth/login', async (req, res) => {
  const body = loginSchema.parse(req.body);
  res.json(await loginUser(body.email, body.password));
});

router.get('/auth/me', requireAuth, async (req, res) => {
  const auth = authOf(req);
  res.json(await store.panelBootstrap(auth.userId, auth.providerId));
});

router.get('/categories', async (_req, res) => {
  res.json({ categories: await store.listCategories() });
});

router.get('/cities', async (req, res) => {
  const query = citySearchSchema.parse(req.query);
  try {
    res.json({ cities: await searchCities(query.q, query.limit) });
  } catch {
    throw new HttpError(502, 'Não foi possível buscar as cidades agora');
  }
});

router.get('/bootstrap', async (_req, res) => {
  res.json(await store.bootstrap());
});

router.get('/meta', async (_req, res) => {
  res.json(await store.buildMeta());
});

router.get('/providers', async (req, res) => {
  const query = searchQuerySchema.parse(req.query);
  const providers = await store.listProviders({
    q: query.q,
    city: query.city ?? DEFAULT_CITY,
    categories: query.categories,
    mode: query.mode,
    priceOnly: query.priceOnly,
  });
  res.json({ providers });
});

router.get('/providers/:id', async (req, res) => {
  res.json(await store.getProvider(routeParam(req, 'id')));
});

router.get('/panel/profile', requireAuth, async (req, res) => {
  res.json(await store.getPanelProfile(authOf(req).providerId));
});

router.put('/panel/profile', requireAuth, async (req, res) => {
  const body = profileSchema.parse(req.body);
  res.json(await store.updatePanelProfile(authOf(req).providerId, body));
});

router.post('/panel/profile/reset', requireAuth, async (req, res) => {
  res.json(await store.resetPanelProfile(authOf(req).providerId));
});

router.get('/panel/services', requireAuth, async (req, res) => {
  res.json({ services: await store.listPanelServices(authOf(req).providerId) });
});

router.post('/panel/services', requireAuth, async (req, res) => {
  const body = serviceSchema.parse(req.body);
  res.status(201).json(await store.createPanelService(authOf(req).providerId, body));
});

router.get('/panel/services/:id', requireAuth, async (req, res) => {
  const id = z.coerce.number().int().positive().parse(routeParam(req, 'id'));
  res.json(await store.getPanelService(authOf(req).providerId, id));
});

router.patch('/panel/services/:id', requireAuth, async (req, res) => {
  const id = z.coerce.number().int().positive().parse(routeParam(req, 'id'));
  const body = servicePatchSchema.parse(req.body);
  res.json(await store.updatePanelService(authOf(req).providerId, id, body));
});

router.delete('/panel/services/:id', requireAuth, async (req, res) => {
  const id = z.coerce.number().int().positive().parse(routeParam(req, 'id'));
  await store.deletePanelService(authOf(req).providerId, id);
  res.status(204).end();
});

router.get('/panel/products', requireAuth, async (req, res) => {
  res.json({ products: await store.listPanelProducts(authOf(req).providerId) });
});

router.post('/panel/products', requireAuth, async (req, res) => {
  const body = productSchema.parse(req.body);
  res.status(201).json(await store.createPanelProduct(authOf(req).providerId, body));
});

router.get('/panel/products/:id', requireAuth, async (req, res) => {
  const id = z.coerce.number().int().positive().parse(routeParam(req, 'id'));
  res.json(await store.getPanelProduct(authOf(req).providerId, id));
});

router.patch('/panel/products/:id', requireAuth, async (req, res) => {
  const id = z.coerce.number().int().positive().parse(routeParam(req, 'id'));
  const body = productPatchSchema.parse(req.body);
  res.json(await store.updatePanelProduct(authOf(req).providerId, id, body));
});

router.delete('/panel/products/:id', requireAuth, async (req, res) => {
  const id = z.coerce.number().int().positive().parse(routeParam(req, 'id'));
  await store.deletePanelProduct(authOf(req).providerId, id);
  res.status(204).end();
});

router.use((_req, _res, next) => {
  next(new HttpError(404, 'Rota não encontrada'));
});
