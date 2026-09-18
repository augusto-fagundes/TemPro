const GUEST_ONBOARDED_KEY = 'tempro.guestOnboarded';

export const GATE_PATHS = ['/bem-vindo', '/onboarding'] as const;
export const AUTH_PATHS = ['/entrar', '/cadastrar'] as const;

export function isGatePath(pathname: string): boolean {
  return (GATE_PATHS as readonly string[]).includes(pathname);
}

export function isAuthPath(pathname: string): boolean {
  return (AUTH_PATHS as readonly string[]).includes(pathname);
}

export function hasSeenGuestOnboarding(): boolean {
  try {
    return localStorage.getItem(GUEST_ONBOARDED_KEY) === '1';
  } catch {
    return false;
  }
}

export function markGuestOnboarded(): void {
  try {
    localStorage.setItem(GUEST_ONBOARDED_KEY, '1');
  } catch {
    // Private mode: the flag lasts until reload.
  }
}
