import type { OwnedService, PriceType } from '../types';

/**
 * Renders a price the way it appears on a card. An amount is required for
 * every type but "Sob consulta"; leaving it blank falls back to that, so a
 * half-filled form still publishes something truthful.
 */
export function formatPrice(type: PriceType, amount: string): string {
  const value = amount.trim();
  if (type === 'Sob consulta' || !value) return 'Sob consulta';

  const money = `R$ ${value}`;
  if (type === 'A partir de') return `A partir de ${money}`;
  if (type === 'Por hora') return `${money} por hora`;
  return money;
}

/** The display price of a stored service. */
export function servicePrice(service: OwnedService): string {
  return formatPrice(service.priceType, service.priceAmount);
}
