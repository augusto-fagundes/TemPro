/** How a provider delivers a service. */
export type ServiceMode = 'Em domicílio' | 'Em estabelecimento' | 'Ambos';

export const SERVICE_MODES: ServiceMode[] = [
  'Em domicílio',
  'Em estabelecimento',
  'Ambos',
];

/** How a provider works, as shown on cards and filters. */
export type ProviderMode =
  | 'Atende em domicílio'
  | 'Possui estabelecimento'
  | 'Ambos';

export const PROVIDER_MODES: ProviderMode[] = [
  'Atende em domicílio',
  'Possui estabelecimento',
  'Ambos',
];

export const PRICE_TYPES = [
  'Valor fixo',
  'A partir de',
  'Por hora',
  'Sob consulta',
] as const;

export type PriceType = (typeof PRICE_TYPES)[number];

export interface Service {
  name: string;
  desc: string;
  mode: ServiceMode;
  price: string;
}

export interface Provider {
  id: string;
  name: string;
  category: string;
  desc: string;
  city: string;
  /** All cities this provider serves. `city` is the first / primary one. */
  cities?: string[];
  mode: ProviderMode;
  /** Empty string when the provider has not published a price. */
  price: string;
  about: string;
  services: Service[];
  products?: PublicProduct[];
  address?: string;
  photoUrl?: string;
  /** Portfolio images. The profile hides the gallery when there are none. */
  photos?: string[];
  /** Digits only, with country and area code — e.g. "5551999998888". */
  whatsapp?: string;
  phone?: string;
  /** Handle without the "@". */
  instagram?: string;
}

export interface PublicProduct {
  name: string;
  desc: string;
  category: string;
  price: string;
  photoUrl?: string;
}

/**
 * A service row in the provider's own panel. The price is kept as the parts
 * the form collects, never as the rendered string: storing "A partir de R$ 150"
 * would have to be parsed back apart every time the row is edited.
 */
export interface OwnedService {
  id: number;
  name: string;
  category: string;
  description: string;
  mode: ServiceMode;
  priceType: PriceType;
  /** Amount in reais, as typed. Empty when the type is "Sob consulta". */
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

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  providerId: string;
}

/** Everything the provider can change about their public listing. */
export interface ProviderProfile {
  name: string;
  category: string;
  desc: string;
  about: string;
  city: string;
  cities: string[];
  mode: ProviderMode;
  address: string;
  whatsapp: string;
  phone: string;
  instagram: string;
  photoUrl: string;
}

export type ModeFilter = 'Todos' | ProviderMode;

export interface SearchFilters {
  /** Free text matched loosely across name, category, description and city. */
  q: string;
  city: string;
  /** Selected categories. Empty means every category. */
  categories: string[];
  mode: ModeFilter;
  priceOnly: boolean;
}

export type PublicView = 'home' | 'results' | 'profile';
export type PanelView = 'overview' | 'services' | 'new';

export const ALL_CITIES = 'Todas as cidades';
export const ALL_CATEGORIES = 'Todas as categorias';

/** Home city of the marketplace — the search starts here. */
export const DEFAULT_CITY = 'Santa Cruz do Sul - RS';
