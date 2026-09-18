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

/**
 * Case- and accent-insensitive form, for matching against something a person
 * typed. Cities need it most: the same place reaches us typed by hand on a
 * profile, picked from the IBGE list and pasted into a link, and "Venancio
 * Aires - rs" has to find the providers listed under "Venâncio Aires - RS".
 */
export function fold(value: string): string {
  return stripAccents(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

export function sameCity(a: string, b: string): boolean {
  return fold(a) === fold(b);
}

/**
 * Whether anyone at all serves the city — the question behind the empty state,
 * and a different one from "does anyone match these filters".
 */
export function cityHasProviders(providers: Provider[], city: string): boolean {
  if (city === ALL_CITIES) return providers.length > 0;
  return providers.some((provider) =>
    providerCities(provider).some((served) => sameCity(served, city)),
  );
}

function ufOf(city: string): string {
  return /- ([A-Z]{2})$/.exec(city)?.[1] ?? '';
}

/**
 * Where to send someone whose city has nobody: the cities that do have
 * providers, same state first. Same state is a rough stand-in for "close by" —
 * the catalogue stores no coordinates — and it is honest enough to order a
 * short list; it is not a distance, so the list stays capped rather than
 * pretending to rank the whole country.
 */
export function otherListedCities(
  listed: string[],
  city: string,
  limit = 8,
): string[] {
  const uf = ufOf(city);
  return listed
    .filter((option) => !sameCity(option, city))
    .sort((a, b) => {
      const byUf = Number(ufOf(b) === uf) - Number(ufOf(a) === uf);
      return byUf !== 0 ? byUf : a.localeCompare(b, 'pt-BR');
    })
    .slice(0, limit);
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

  if (filters.priceOnly && !provider.price) return false;

  if (
    filters.city !== ALL_CITIES &&
    !queryNamesCity(query, cityTerms) &&
    !providerCities(provider).some((city) => sameCity(city, filters.city))
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
export function shortCity(city: string): string {
  return city === ALL_CITIES
    ? 'todas as cidades'
    : city.replace(/ - [A-Z]{2}$/, '');
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

/**
 * Names the category selection on a filter control, where the space is one
 * line: past two the tail is counted instead of listed.
 */
export function categorySummary(categories: string[]): string {
  if (categories.length === 0) return 'Todas as categorias';
  if (categories.length === 1) return categories[0];
  if (categories.length === 2) return `${categories[0]} e ${categories[1]}`;
  return `${categories[0]} +${categories.length - 1}`;
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
      (city === ALL_CITIES ||
        providerCities(provider).some((served) => sameCity(served, city))),
  ).length;
}
