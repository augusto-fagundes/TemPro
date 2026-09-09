import { PRICE_TYPES } from './data/taxonomy';

export type PriceType = (typeof PRICE_TYPES)[number];

export function formatPrice(type: PriceType, amount: string): string {
  const value = amount.trim();
  if (type === 'Sob consulta' || !value) return 'Sob consulta';

  const money = `R$ ${value}`;
  if (type === 'A partir de') return `A partir de ${money}`;
  if (type === 'Por hora') return `${money} por hora`;
  return money;
}

export function parsePrice(price: string): {
  priceType: PriceType;
  priceAmount: string;
  displayPrice: string;
} {
  const trimmed = price.trim();
  if (!trimmed || trimmed === 'Sob consulta') {
    return {
      priceType: 'Sob consulta',
      priceAmount: '',
      displayPrice: trimmed || 'Sob consulta',
    };
  }

  const amountMatch = trimmed.match(/R\$\s*([\d.]+)/);
  const priceAmount = amountMatch?.[1] ?? '';

  if (trimmed.startsWith('A partir de')) {
    return { priceType: 'A partir de', priceAmount, displayPrice: trimmed };
  }
  if (/por hora/i.test(trimmed)) {
    return { priceType: 'Por hora', priceAmount, displayPrice: trimmed };
  }
  return { priceType: 'Valor fixo', priceAmount, displayPrice: trimmed };
}

export function listingPriceFromServices(
  displayPrices: string[],
): string {
  const priced = displayPrices.find(
    (price) => price.trim() && price !== 'Sob consulta',
  );
  return priced ?? '';
}
