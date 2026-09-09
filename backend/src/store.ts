import { normalizeCities } from './cities';
import { prisma } from './db';
import { ALL_CITIES } from './data/taxonomy';
import { HttpError } from './errors';
import {
  providerInclude,
  toOwnedProduct,
  toOwnedService,
  toProfile,
  toPublicProvider,
  type CatalogMeta,
  type OwnedProduct,
  type OwnedService,
  type ProviderProfile,
  type PublicProvider,
} from './mappers';
import { formatPrice, listingPriceFromServices, type PriceType } from './pricing';
import { searchProviders, type SearchFilters } from './search';
import { SEED_PROVIDERS } from './data/seed-providers';
import { getUserById } from './users';

function distinct(values: string[]): string[] {
  return [...new Set(values)];
}

function sortPt(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

export async function listProviders(filters?: SearchFilters): Promise<PublicProvider[]> {
  const rows = await prisma.provider.findMany({
    include: providerInclude,
    orderBy: { sortOrder: 'asc' },
  });
  const providers = rows.map(toPublicProvider);
  if (!filters) return providers;
  return searchProviders(providers, filters);
}

export async function getProvider(id: string): Promise<PublicProvider> {
  const row = await prisma.provider.findUnique({
    where: { id },
    include: providerInclude,
  });
  if (!row) throw new HttpError(404, 'Prestador não encontrado');
  return toPublicProvider(row);
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
}

async function requireCategoryByName(name: string) {
  const row = await prisma.category.findUnique({
    where: { name: name.trim() },
  });
  if (!row) throw new HttpError(400, 'Categoria inválida');
  return row;
}

export async function buildMeta(): Promise<CatalogMeta> {
  const [providers, categoryRows] = await Promise.all([
    listProviders(),
    listCategories(),
  ]);
  const serviceCategories = categoryRows.map((row) => row.name);
  const listed = distinct(providers.map((p) => p.category));
  const featuredCategories = [...listed]
    .sort((a, b) => {
      const byCount =
        providers.filter((p) => p.category === b).length -
        providers.filter((p) => p.category === a).length;
      return byCount !== 0 ? byCount : a.localeCompare(b, 'pt-BR');
    })
    .slice(0, 8);

  return {
    categories: listed.sort((a, b) => a.localeCompare(b, 'pt-BR')),
    cities: [
      ...sortPt(distinct(providers.flatMap((p) => p.cities))),
      ALL_CITIES,
    ],
    featuredCategories,
    serviceCategories,
    categoryPlural: Object.fromEntries(
      categoryRows.map((row) => [row.name, row.plural]),
    ),
  };
}

async function loadProvider(providerId: string) {
  const row = await prisma.provider.findUnique({
    where: { id: providerId },
    include: providerInclude,
  });
  if (!row) throw new HttpError(404, 'Prestador não encontrado');
  return row;
}

export async function getPanelProfile(providerId: string): Promise<ProviderProfile> {
  return toProfile(await loadProvider(providerId));
}

export async function updatePanelProfile(
  providerId: string,
  patch: ProviderProfile,
): Promise<ProviderProfile> {
  const showsAddress = patch.mode !== 'Atende em domicílio';
  const cities = normalizeCities(patch.cities ?? [patch.city]);
  const city = cities[0] ?? patch.city.trim();
  const updated = await prisma.provider.update({
    where: { id: providerId },
    data: {
      name: patch.name.trim(),
      category: patch.category,
      description: patch.desc,
      about: patch.about,
      city,
      serviceCities: cities,
      mode: patch.mode,
      address: showsAddress ? patch.address.trim() || null : null,
      whatsapp: patch.whatsapp.replace(/\D/g, '') || null,
      phone: patch.phone.trim() || null,
      instagram: patch.instagram.trim().replace(/^@/, '') || null,
      photoUrl: patch.photoUrl.trim() || null,
    },
  });
  return toProfile(updated);
}

export async function resetPanelProfile(providerId: string): Promise<ProviderProfile> {
  const seed = SEED_PROVIDERS.find((provider) => provider.id === providerId);
  if (!seed) {
    throw new HttpError(400, 'Só o cadastro de exemplo pode ser restaurado');
  }

  const updated = await prisma.provider.update({
    where: { id: providerId },
    data: {
      name: seed.name,
      category: seed.category,
      description: seed.desc,
      about: seed.about,
      city: seed.city,
      serviceCities: [seed.city],
      mode: seed.mode,
      address: seed.address ?? null,
      whatsapp: null,
      phone: null,
      instagram: null,
    },
  });
  return toProfile(updated);
}

export async function listPanelServices(providerId: string): Promise<OwnedService[]> {
  const current = await loadProvider(providerId);
  return current.services.map(toOwnedService);
}

export async function getPanelService(
  providerId: string,
  id: number,
): Promise<OwnedService> {
  const current = await loadProvider(providerId);
  const service = current.services.find((item) => item.id === id);
  if (!service) throw new HttpError(404, 'Serviço não encontrado');
  return toOwnedService(service);
}

interface ServiceInput {
  name: string;
  category: string;
  description: string;
  mode: string;
  priceType: PriceType;
  priceAmount: string;
}

async function syncListingPrice(providerId: string) {
  const services = await prisma.service.findMany({
    where: { providerId },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  await prisma.provider.update({
    where: { id: providerId },
    data: {
      listingPrice: listingPriceFromServices(
        services.map((service) => service.displayPrice),
      ),
    },
  });
}

export async function createPanelService(
  providerId: string,
  input: ServiceInput,
): Promise<OwnedService> {
  const current = await loadProvider(providerId);
  const category = await requireCategoryByName(input.category);
  const amount = input.priceType === 'Sob consulta' ? '' : input.priceAmount.trim();
  const created = await prisma.service.create({
    data: {
      providerId,
      categoryId: category.id,
      name: input.name.trim(),
      description: input.description.trim(),
      mode: input.mode,
      priceType: input.priceType,
      priceAmount: amount,
      displayPrice: formatPrice(input.priceType, amount),
      sortOrder: current.services.length,
    },
    include: { category: true },
  });
  await syncListingPrice(providerId);
  return toOwnedService(created);
}

export async function updatePanelService(
  providerId: string,
  id: number,
  patch: Partial<ServiceInput>,
): Promise<OwnedService> {
  const current = await loadProvider(providerId);
  const existing = current.services.find((item) => item.id === id);
  if (!existing) throw new HttpError(404, 'Serviço não encontrado');

  const priceType = (patch.priceType ?? existing.priceType) as PriceType;
  const priceAmount =
    priceType === 'Sob consulta'
      ? ''
      : (patch.priceAmount ?? existing.priceAmount).trim();

  const categoryId = patch.category
    ? (await requireCategoryByName(patch.category)).id
    : existing.categoryId;

  const updated = await prisma.service.update({
    where: { id },
    data: {
      name: patch.name?.trim() ?? existing.name,
      categoryId,
      description:
        patch.description !== undefined
          ? patch.description.trim()
          : existing.description,
      mode: patch.mode ?? existing.mode,
      priceType,
      priceAmount,
      displayPrice: formatPrice(priceType, priceAmount),
    },
    include: { category: true },
  });
  await syncListingPrice(providerId);
  return toOwnedService(updated);
}

export async function deletePanelService(providerId: string, id: number): Promise<void> {
  const current = await loadProvider(providerId);
  const existing = current.services.find((item) => item.id === id);
  if (!existing) throw new HttpError(404, 'Serviço não encontrado');
  await prisma.service.delete({ where: { id } });
  await syncListingPrice(providerId);
}

interface ProductInput {
  name: string;
  category: string;
  description: string;
  priceType: PriceType;
  priceAmount: string;
  photoUrl: string;
}

export async function listPanelProducts(providerId: string): Promise<OwnedProduct[]> {
  const current = await loadProvider(providerId);
  return current.products.map(toOwnedProduct);
}

export async function getPanelProduct(
  providerId: string,
  id: number,
): Promise<OwnedProduct> {
  const current = await loadProvider(providerId);
  const product = current.products.find((item) => item.id === id);
  if (!product) throw new HttpError(404, 'Produto não encontrado');
  return toOwnedProduct(product);
}

export async function createPanelProduct(
  providerId: string,
  input: ProductInput,
): Promise<OwnedProduct> {
  const current = await loadProvider(providerId);
  const amount = input.priceType === 'Sob consulta' ? '' : input.priceAmount.trim();
  const created = await prisma.product.create({
    data: {
      providerId,
      name: input.name.trim(),
      category: input.category,
      description: input.description.trim(),
      priceType: input.priceType,
      priceAmount: amount,
      displayPrice: formatPrice(input.priceType, amount),
      photoUrl: input.photoUrl.trim() || null,
      sortOrder: current.products.length,
    },
  });
  return toOwnedProduct(created);
}

export async function updatePanelProduct(
  providerId: string,
  id: number,
  patch: Partial<ProductInput>,
): Promise<OwnedProduct> {
  const current = await loadProvider(providerId);
  const existing = current.products.find((item) => item.id === id);
  if (!existing) throw new HttpError(404, 'Produto não encontrado');

  const priceType = (patch.priceType ?? existing.priceType) as PriceType;
  const priceAmount =
    priceType === 'Sob consulta'
      ? ''
      : (patch.priceAmount ?? existing.priceAmount).trim();

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: patch.name?.trim() ?? existing.name,
      category: patch.category ?? existing.category,
      description:
        patch.description !== undefined
          ? patch.description.trim()
          : existing.description,
      priceType,
      priceAmount,
      displayPrice: formatPrice(priceType, priceAmount),
      photoUrl:
        patch.photoUrl !== undefined
          ? patch.photoUrl.trim() || null
          : existing.photoUrl,
    },
  });
  return toOwnedProduct(updated);
}

export async function deletePanelProduct(providerId: string, id: number): Promise<void> {
  const current = await loadProvider(providerId);
  const existing = current.products.find((item) => item.id === id);
  if (!existing) throw new HttpError(404, 'Produto não encontrado');
  await prisma.product.delete({ where: { id } });
}

export async function bootstrap() {
  const [providers, meta] = await Promise.all([listProviders(), buildMeta()]);
  return { providers, meta };
}

export async function panelBootstrap(userId: number, providerId: string) {
  const [user, profile, services, products] = await Promise.all([
    getUserById(userId),
    getPanelProfile(providerId),
    listPanelServices(providerId),
    listPanelProducts(providerId),
  ]);
  return { user, profile, services, products };
}
