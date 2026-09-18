import { ALL_CITIES } from './data/taxonomy';
import type { PublicProvider } from './mappers';

export interface SearchFilters {
  q: string;
  city: string;
  categories: string[];
  priceOnly: boolean;
}

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

/** Mirrors the client: cities are compared folded, not by string equality. */
function normalizeCity(city: string): string {
  return stripAccents(city).trim().toLowerCase().replace(/\s+/g, ' ');
}

function sameCity(a: string, b: string): boolean {
  return normalizeCity(a) === normalizeCity(b);
}

function citySearchTerms(providers: PublicProvider[]): string[] {
  const terms = new Set<string>();
  for (const provider of providers) {
    for (const city of provider.cities.length > 0 ? provider.cities : [provider.city]) {
      const name = city.replace(/ - [A-Z]{2}$/, '').toLowerCase();
      terms.add(name);
      terms.add(stripAccents(name));
    }
  }
  return [...terms];
}

function queryNamesCity(query: string, terms: string[]): boolean {
  return query !== '' && terms.some((term) => query.includes(term));
}

export function matchesFilters(
  provider: PublicProvider,
  filters: SearchFilters,
  cityTerms: string[],
): boolean {
  const query = filters.q.trim().toLowerCase();
  const haystack = [
    provider.name,
    provider.category,
    provider.desc,
    provider.city,
    ...provider.cities,
  ]
    .join(' ')
    .toLowerCase();

  if (filters.priceOnly && !provider.price) return false;

  if (
    filters.city !== ALL_CITIES &&
    !queryNamesCity(query, cityTerms) &&
    !provider.cities.some((city) => sameCity(city, filters.city))
  ) {
    return false;
  }

  if (query) {
    return query.split(/\s+/).every((word) => haystack.includes(word));
  }

  if (
    filters.categories.length > 0 &&
    !filters.categories.includes(provider.category)
  ) {
    return false;
  }

  return true;
}

export function searchProviders(
  providers: PublicProvider[],
  filters: SearchFilters,
): PublicProvider[] {
  const cityTerms = citySearchTerms(providers);
  return providers.filter((provider) =>
    matchesFilters(provider, filters, cityTerms),
  );
}
