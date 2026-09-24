/**
 * Social handles on the provider profile. People paste a username ("joao"),
 * an @handle, or a full profile URL — all three should round-trip cleanly
 * into the public Instagram / Facebook buttons.
 */

function withHttps(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function hostOf(hostname: string): string {
  return hostname.replace(/^www\./i, '').toLowerCase();
}

/**
 * Prefer a bare handle when the URL is a simple profile path; keep the full
 * URL for posts, reels, or anything we cannot safely reduce.
 */
export function normalizeInstagram(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const looksLikeUrl =
    /^https?:\/\//i.test(trimmed) || /instagram\.com/i.test(trimmed);
  if (looksLikeUrl) {
    try {
      const url = new URL(withHttps(trimmed));
      if (hostOf(url.hostname) === 'instagram.com') {
        const [first] = url.pathname.split('/').filter(Boolean);
        const reserved = new Set(['p', 'reel', 'reels', 'stories', 'explore', 'tv']);
        if (first && !reserved.has(first.toLowerCase())) {
          return first.replace(/^@/, '');
        }
      }
      return url.toString();
    } catch {
      return trimmed.replace(/^@/, '');
    }
  }

  return trimmed.replace(/^@/, '').replace(/^\/+/, '');
}

/**
 * Facebook pages accept a vanity name or a profile.php?id=… link. Keep the
 * full URL when there is a query string; otherwise store the vanity handle.
 */
export function normalizeFacebook(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const looksLikeUrl =
    /^https?:\/\//i.test(trimmed) || /(facebook|fb)\.com/i.test(trimmed);
  if (looksLikeUrl) {
    try {
      const url = new URL(withHttps(trimmed));
      const host = hostOf(url.hostname);
      if (host === 'facebook.com' || host === 'fb.com' || host === 'm.facebook.com') {
        if (url.pathname.includes('profile.php') || url.search.length > 0) {
          return `https://www.facebook.com${url.pathname}${url.search}`;
        }
        const [first] = url.pathname.split('/').filter(Boolean);
        const reserved = new Set(['pages', 'groups', 'events', 'watch', 'marketplace', 'share']);
        if (first && !reserved.has(first.toLowerCase())) {
          return first.replace(/^@/, '');
        }
      }
      return url.toString();
    } catch {
      return trimmed.replace(/^@/, '');
    }
  }

  return trimmed.replace(/^@/, '').replace(/^\/+/, '');
}

function asExternalUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/\.[a-z]{2,}/i.test(trimmed) && trimmed.includes('/')) {
    return withHttps(trimmed);
  }
  return null;
}

export function instagramHref(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const external = asExternalUrl(value);
  if (external) return external;
  const handle = value.trim().replace(/^@/, '');
  return handle ? `https://instagram.com/${handle}` : null;
}

export function facebookHref(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const external = asExternalUrl(value);
  if (external) return external;
  const handle = value.trim().replace(/^@/, '');
  return handle ? `https://www.facebook.com/${handle}` : null;
}
