/**
 * localStorage that never throws. It can be unavailable (private mode,
 * blocked site data) or hold a value written by an older build, so every read
 * is validated and every failure degrades to the seed instead of a crash.
 */

export function readStored<T>(
  key: string,
  isValid: (value: unknown) => value is T,
): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStored(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The session still works, it just will not survive a reload.
  }
}
