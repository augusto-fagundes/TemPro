import type {
  Category,
  Product,
  Provider as DbProvider,
  ProviderPhoto,
  Service,
} from '@prisma/client';

import { servedCities } from './cities';
import type { PriceType } from './pricing';

export type ServiceWithCategory = Service & { category: Category };

export type ProviderWithRelations = DbProvider & {
  services: ServiceWithCategory[];
  photos: ProviderPhoto[];
  products: Product[];
};

export interface PublicService {
  name: string;
  desc: string;
  mode: string;
  price: string;
}

export interface PublicProduct {
  name: string;
  desc: string;
  category: string;
  price: string;
  photoUrl?: string;
}

export interface PublicProvider {
  id: string;
  name: string;
  category: string;
  desc: string;
  city: string;
  cities: string[];
  mode: string;
  price: string;
  about: string;
  services: PublicService[];
  products: PublicProduct[];
  address?: string;
  photoUrl?: string;
  photos?: string[];
  whatsapp?: string;
  phone?: string;
  instagram?: string;
}

export interface ProviderProfile {
  name: string;
  category: string;
  desc: string;
  about: string;
  city: string;
  cities: string[];
  mode: string;
  address: string;
  whatsapp: string;
  phone: string;
  instagram: string;
  photoUrl: string;
}

export interface OwnedService {
  id: number;
  name: string;
  category: string;
  description: string;
  mode: string;
  priceType: PriceType;
  priceAmount: string;
}

export interface OwnedProduct {
  id: number;
  name: string;
  category: string;
  description: string;
  priceType: PriceType;
  priceAmount: string;
  photoUrl: string;
}

export interface CatalogMeta {
  categories: string[];
  cities: string[];
  featuredCategories: string[];
  serviceCategories: string[];
  categoryPlural: Record<string, string>;
}

function optional(value: string | null | undefined): string | undefined {
  return value ? value : undefined;
}

export function toPublicProvider(provider: ProviderWithRelations): PublicProvider {
  const photos = [...provider.photos]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((photo) => photo.url);

  const services = [...provider.services]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    .map((service) => ({
      name: service.name,
      desc: service.description,
      mode: service.mode,
      price: service.displayPrice,
    }));

  const products = [...provider.products]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    .map((product) => ({
      name: product.name,
      desc: product.description,
      category: product.category,
      price: product.displayPrice,
      photoUrl: optional(product.photoUrl),
    }));

  return {
    id: provider.id,
    name: provider.name,
    category: provider.category,
    desc: provider.description,
    city: provider.city,
    cities: servedCities(provider),
    mode: provider.mode,
    price: provider.listingPrice,
    about: provider.about,
    services,
    products,
    address: optional(provider.address),
    photoUrl: optional(provider.photoUrl),
    photos: photos.length > 0 ? photos : undefined,
    whatsapp: optional(provider.whatsapp),
    phone: optional(provider.phone),
    instagram: optional(provider.instagram),
  };
}

export function toProfile(provider: DbProvider): ProviderProfile {
  return {
    name: provider.name,
    category: provider.category,
    desc: provider.description,
    about: provider.about,
    city: provider.city,
    cities: servedCities(provider),
    mode: provider.mode,
    address: provider.address ?? '',
    whatsapp: provider.whatsapp ?? '',
    phone: provider.phone ?? '',
    instagram: provider.instagram ?? '',
    photoUrl: provider.photoUrl ?? '',
  };
}

export function toOwnedService(service: ServiceWithCategory): OwnedService {
  return {
    id: service.id,
    name: service.name,
    category: service.category.name,
    description: service.description,
    mode: service.mode,
    priceType: service.priceType as PriceType,
    priceAmount: service.priceAmount,
  };
}

export function toOwnedProduct(product: Product): OwnedProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    description: product.description,
    priceType: product.priceType as PriceType,
    priceAmount: product.priceAmount,
    photoUrl: product.photoUrl ?? '',
  };
}

export const providerInclude = {
  services: {
    orderBy: [{ sortOrder: 'asc' as const }, { id: 'asc' as const }],
    include: { category: true },
  },
  photos: { orderBy: { sortOrder: 'asc' as const } },
  products: { orderBy: [{ sortOrder: 'asc' as const }, { id: 'asc' as const }] },
};
