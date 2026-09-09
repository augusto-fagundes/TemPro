import { ALL_CITIES } from './data/taxonomy';
import type { PublicProvider } from './mappers';

export interface SearchFilters {
  q: string;
  city: string;
  categories: string[];
  mode: string;
  priceOnly: boolean;
}

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
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

  if (
    filters.mode !== 'Todos' &&
    provider.mode !== filters.mode &&
    provider.mode !== 'Ambos'
  ) {
    return false;
  }

  if (filters.priceOnly && !provider.price) return false;

  if (
    filters.city !== ALL_CITIES &&
    !queryNamesCity(query, cityTerms) &&
    !provider.cities.includes(filters.city)
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
