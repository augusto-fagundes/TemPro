import type { SearchFilters } from '../types';
import { ALL_CITIES, DEFAULT_CITY } from '../types';

/**
 * The search lives in the URL, so a result page can be shared, bookmarked and
 * reached with the back button. Defaults are left out of the query string to
 * keep links short — `/buscar?q=eletricista` rather than a wall of params.
 */

const KEYS = {
  q: 'q',
  city: 'cidade',
  categories: 'categoria',
  priceOnly: 'preco',
} as const;

export const EMPTY_FILTERS: SearchFilters = {
  q: '',
  city: DEFAULT_CITY,
  categories: [],
  priceOnly: false,
};

export function filtersFromParams(params: URLSearchParams): SearchFilters {
  /* Links shared while the "every city" search existed would still open a
     nationwide list nothing in the UI can produce any more; they land on the
     default city instead. */
  const city = params.get(KEYS.city);
  return {
    q: params.get(KEYS.q) ?? '',
    city: !city || city === ALL_CITIES ? DEFAULT_CITY : city,
    // Several categories ride in one param: `?categoria=Eletricista,Pintor`.
    categories: (params.get(KEYS.categories) ?? '')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean),
    priceOnly: params.get(KEYS.priceOnly) === '1',
  };
}

export function paramsFromFilters(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set(KEYS.q, filters.q.trim());
  if (filters.city !== DEFAULT_CITY) params.set(KEYS.city, filters.city);
  if (filters.categories.length) {
    params.set(KEYS.categories, filters.categories.join(','));
  }
  if (filters.priceOnly) params.set(KEYS.priceOnly, '1');
  return params;
}

export function searchPath(filters: Partial<SearchFilters>): string {
  const query = paramsFromFilters({ ...EMPTY_FILTERS, ...filters }).toString();
  return query ? `/buscar?${query}` : '/buscar';
}

export function providerPath(id: string): string {
  return `/prestador/${id}`;
}

export { ALL_CITIES };
