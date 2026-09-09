import type {
  AuthUser,
  OwnedProduct,
  OwnedService,
  Provider,
  ProviderProfile,
} from '../types';

export interface CityMatch {
  id: number;
  name: string;
  uf: string;
  label: string;
}

export interface CatalogMeta {
  categories: string[];
  cities: string[];
  featuredCategories: string[];
  serviceCategories: string[];
  categoryPlural: Record<string, string>;
}

export interface BootstrapPayload {
  providers: Provider[];
  meta: CatalogMeta;
}

export interface PanelPayload {
  user: AuthUser;
  profile: ProviderProfile;
  services: OwnedService[];
  products: OwnedProduct[];
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export const TOKEN_KEY = 'tempro.token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Private mode: the session lasts until reload.
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`/api${path}`, { ...init, headers });
  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : `Erro ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export const api = {
  bootstrap: () => request<BootstrapPayload>('/bootstrap'),

  searchCities: (q: string, limit = 20) =>
    request<{ cities: CityMatch[] }>(
      `/cities?q=${encodeURIComponent(q)}&limit=${limit}`,
    ).then((body) => body.cities),

  register: (body: {
    name: string;
    email: string;
    password: string;
    city?: string;
    cities?: string[];
    category?: string;
  }) =>
    request<AuthSession>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (email: string, password: string) =>
    request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<PanelPayload>('/auth/me'),

  providers: () =>
    request<{ providers: Provider[] }>('/providers').then((body) => body.providers),

  provider: (id: string) => request<Provider>(`/providers/${id}`),

  updateProfile: (profile: ProviderProfile) =>
    request<ProviderProfile>('/panel/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    }),

  resetProfile: () =>
    request<ProviderProfile>('/panel/profile/reset', { method: 'POST' }),

  createService: (draft: Omit<OwnedService, 'id'>) =>
    request<OwnedService>('/panel/services', {
      method: 'POST',
      body: JSON.stringify(draft),
    }),

  updateService: (id: number, draft: Omit<OwnedService, 'id'>) =>
    request<OwnedService>(`/panel/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(draft),
    }),

  deleteService: (id: number) =>
    request<void>(`/panel/services/${id}`, { method: 'DELETE' }),
};
