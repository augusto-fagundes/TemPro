export interface CityMatch {
  id: number;
  name: string;
  uf: string;
  label: string;
}

type IbgeMunicipio = {
  id?: number;
  nome?: string;
  microrregiao?: {
    mesorregiao?: {
      UF?: { sigla?: string };
    };
  };
  'regiao-imediata'?: {
    'regiao-intermediaria'?: {
      UF?: { sigla?: string };
    };
  };
};

const IBGE_URL =
  'https://servicodados.ibge.gov.br/api/v1/localidades/municipios';
const CACHE_MS = 24 * 60 * 60 * 1000;

let cache: CityMatch[] | null = null;
let cachedAt = 0;
let loading: Promise<CityMatch[]> | null = null;

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export function normalizeCityQuery(value: string): string {
  return stripAccents(value).trim().toLowerCase();
}

export function normalizeCities(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const city = raw.trim();
    if (!city || seen.has(city)) continue;
    seen.add(city);
    out.push(city);
  }
  return out;
}

export function servedCities(provider: {
  city: string;
  serviceCities?: string[] | null;
}): string[] {
  return normalizeCities([provider.city, ...(provider.serviceCities ?? [])]);
}

function ufOf(row: IbgeMunicipio): string {
  return (
    row.microrregiao?.mesorregiao?.UF?.sigla ||
    row['regiao-imediata']?.['regiao-intermediaria']?.UF?.sigla ||
    ''
  );
}

function toMatch(row: IbgeMunicipio): CityMatch | null {
  if (typeof row.id !== 'number' || !row.nome) return null;
  const uf = ufOf(row);
  if (!uf) return null;
  return {
    id: row.id,
    name: row.nome,
    uf,
    label: `${row.nome} - ${uf}`,
  };
}

async function loadCities(): Promise<CityMatch[]> {
  if (cache && Date.now() - cachedAt < CACHE_MS) return cache;
  if (loading) return loading;

  loading = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    try {
      const response = await fetch(IBGE_URL, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`IBGE ${response.status}`);
      }
      const payload = (await response.json()) as IbgeMunicipio[];
      const rows = payload
        .map(toMatch)
        .filter((row): row is CityMatch => row !== null)
        .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
      cache = rows;
      cachedAt = Date.now();
      return rows;
    } finally {
      clearTimeout(timer);
      loading = null;
    }
  })();

  return loading;
}

export async function searchCities(
  query: string,
  limit = 20,
): Promise<CityMatch[]> {
  const needle = normalizeCityQuery(query);
  if (needle.length < 2) return [];

  const rows = await loadCities();
  const matched: CityMatch[] = [];
  for (const row of rows) {
    if (normalizeCityQuery(row.label).includes(needle)) {
      matched.push(row);
      if (matched.length >= limit) break;
    }
  }
  return matched;
}
