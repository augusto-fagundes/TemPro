import { CATEGORY_PLURAL } from '../data/taxonomy';
import type { Provider, SearchFilters } from '../types';
import { ALL_CITIES } from '../types';

function providerCities(provider: Provider): string[] {
  if (provider.cities && provider.cities.length > 0) return provider.cities;
  return provider.city ? [provider.city] : [];
}

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function citySearchTerms(providers: Provider[]): string[] {
  const terms = new Set<string>();
  for (const provider of providers) {
    for (const city of providerCities(provider)) {
      const name = city.replace(/ - [A-Z]{2}$/, '').toLowerCase();
      terms.add(name);
      terms.add(stripAccents(name));
    }
  }
  return [...terms];
}

/**
 * True when the query names a city. In that case the city dropdown is
 * ignored — typing "vidraceiro lajeado" should reach Lajeado even while the
 * selector still says Santa Cruz do Sul.
 */
function queryNamesCity(query: string, terms: string[]): boolean {
  return query !== '' && terms.some((term) => query.includes(term));
}

/**
 * One free-text field matched loosely across name, category, description and
 * city: every word typed must appear somewhere in the provider's text, so
 * "eletricista joão" narrows rather than widens.
 *
 * A query supersedes the category selection — the words already say what the
 * person is after, and keeping both would silently return nothing whenever
 * they disagreed.
 */
export function matchesFilters(
  provider: Provider,
  filters: SearchFilters,
  cityTerms: string[],
): boolean {
  const query = filters.q.trim().toLowerCase();
  const haystack = [
    provider.name,
    provider.category,
    provider.desc,
    provider.city,
    ...providerCities(provider),
  ]
    .join(' ')
    .toLowerCase();

  // A provider marked "Ambos" satisfies either delivery mode.
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
    !providerCities(provider).includes(filters.city)
  ) {
    return false;
  }

  if (query) {
    return query.split(/\s+/).every((word) => haystack.includes(word));
  }

  // No categories picked means every category, not none.
  if (
    filters.categories.length > 0 &&
    !filters.categories.includes(provider.category)
  ) {
    return false;
  }

  return true;
}

export function searchProviders(
  providers: Provider[],
  filters: SearchFilters,
): Provider[] {
  const cityTerms = citySearchTerms(providers);
  return providers.filter((provider) =>
    matchesFilters(provider, filters, cityTerms),
  );
}

/** "Santa Cruz do Sul - RS" → "Santa Cruz do Sul"; the state is implied. */
function shortCity(city: string): string {
  return city === ALL_CITIES ? 'todas as cidades' : city.replace(' - RS', '');
}

/**
 * Names the selection in the headline. Past two categories the list would be
 * longer than the rest of the title, so the tail is counted instead of spelled
 * out: "Eletricistas, Pintores e mais 2".
 */
function categoryHeadline(categories: string[]): string {
  const names = categories.map((name) => CATEGORY_PLURAL[name] ?? name);
  if (names.length === 0) return 'Profissionais';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  return `${names[0]}, ${names[1]} e mais ${names.length - 2}`;
}

/** Headline over the results list, echoing back what was asked for. */
export function resultsTitle(
  filters: SearchFilters,
  providers: Provider[] = [],
): string {
  const query = filters.q.trim();
  if (query) {
    /* When the query names a city it overrides the city selector, so naming
       the selector's city here would contradict the list below it. */
    return queryNamesCity(query.toLowerCase(), citySearchTerms(providers))
      ? `“${query}”`
      : `“${query}” em ${shortCity(filters.city)}`;
  }

  return `${categoryHeadline(filters.categories)} em ${shortCity(filters.city)}`;
}

export function countLabel(
  count: number,
  singular: string,
  plural: string,
): string {
  return `${count === 1 ? '1' : count} ${count === 1 ? singular : plural}`;
}

/** How many providers a category has in the currently selected city. */
export function countInCategory(
  providers: Provider[],
  category: string,
  city: string,
): number {
  return providers.filter(
    (provider) =>
      provider.category === category &&
      (city === ALL_CITIES || providerCities(provider).includes(city)),
  ).length;
}
