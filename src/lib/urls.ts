import type { ModeFilter, SearchFilters } from '../types';
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
  mode: 'forma',
  priceOnly: 'preco',
} as const;

const MODES: ModeFilter[] = [
  'Todos',
  'Atende em domicílio',
  'Possui estabelecimento',
  'Ambos',
];

export const EMPTY_FILTERS: SearchFilters = {
  q: '',
  city: DEFAULT_CITY,
  categories: [],
  mode: 'Todos',
  priceOnly: false,
};

export function filtersFromParams(params: URLSearchParams): SearchFilters {
  const mode = params.get(KEYS.mode);
  return {
    q: params.get(KEYS.q) ?? '',
    city: params.get(KEYS.city) ?? DEFAULT_CITY,
    // Several categories ride in one param: `?categoria=Eletricista,Pintor`.
    categories: (params.get(KEYS.categories) ?? '')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean),
    mode: MODES.includes(mode as ModeFilter) ? (mode as ModeFilter) : 'Todos',
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
  if (filters.mode !== 'Todos') params.set(KEYS.mode, filters.mode);
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
