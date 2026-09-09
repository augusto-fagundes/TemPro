export const ALL_CITIES = 'Todas as cidades';
export const DEFAULT_CITY = 'Santa Cruz do Sul - RS';

export const PROVIDER_MODES = [
  'Atende em domicílio',
  'Possui estabelecimento',
  'Ambos',
] as const;

export const SERVICE_MODES = [
  'Em domicílio',
  'Em estabelecimento',
  'Ambos',
] as const;

export const PRICE_TYPES = [
  'Valor fixo',
  'A partir de',
  'Por hora',
  'Sob consulta',
] as const;

export const CATEGORY_ROWS = [
  { name: 'Ar-condicionado', plural: 'Ar-condicionado' },
  { name: 'Chaveiro', plural: 'Chaveiros' },
  { name: 'Diarista', plural: 'Diaristas' },
  { name: 'Eletricista', plural: 'Eletricistas' },
  { name: 'Encanador', plural: 'Encanadores' },
  { name: 'Fotógrafo', plural: 'Fotógrafos' },
  { name: 'Informática', plural: 'Informática' },
  { name: 'Jardinagem', plural: 'Jardinagem' },
  { name: 'Limpeza', plural: 'Limpeza' },
  { name: 'Marceneiro', plural: 'Marceneiros' },
  { name: 'Mecânico', plural: 'Mecânicos' },
  { name: 'Pedreiro', plural: 'Pedreiros' },
  { name: 'Pintor', plural: 'Pintores' },
  { name: 'Serralheiro', plural: 'Serralheiros' },
  { name: 'Técnico de informática', plural: 'Técnicos de informática' },
  { name: 'Vidraceiro', plural: 'Vidraceiros' },
] as const;

export const CATEGORY_PLURAL: Record<string, string> = Object.fromEntries(
  CATEGORY_ROWS.map((row) => [row.name, row.plural]),
);

export const SIGNED_IN_PROVIDER_FALLBACK = 'joao';
