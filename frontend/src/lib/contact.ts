import type { Provider } from '../types';

/**
 * Contact hand-offs. Every provider in the seed catalogue is still missing
 * its real numbers, so each helper returns `null` and the caller falls back
 * to a confirmation toast. Fill `whatsapp` / `phone` / `instagram` on a
 * provider and the same buttons start opening the real thing — no UI change.
 */

/**
 * wa.me needs the country code. People type their number the way they say it
 * — "(51) 99999-8888" — so a 10 or 11 digit national number gets Brazil's 55
 * in front; anything longer already carries its own country code.
 */
function normalizeWhatsapp(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits.length >= 12 ? digits : null;
}

export function whatsappUrl(provider: Provider): string | null {
  if (!provider.whatsapp) return null;
  const number = normalizeWhatsapp(provider.whatsapp);
  if (!number) return null;

  const text = encodeURIComponent(
    `Olá, ${provider.name}! Encontrei você no Serviços Perto.`,
  );
  return `https://wa.me/${number}?text=${text}`;
}

export function phoneUrl(provider: Provider): string | null {
  return provider.phone ? `tel:${provider.phone}` : null;
}

export function instagramUrl(provider: Provider): string | null {
  return provider.instagram
    ? `https://instagram.com/${provider.instagram}`
    : null;
}

/**
 * Opens `url` in a new tab and reports whether it could. Returns false when
 * there is nothing to open, so the caller can show a placeholder instead.
 */
export function openExternal(url: string | null): boolean {
  if (!url) return false;
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}
