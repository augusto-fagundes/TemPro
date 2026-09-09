import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { api, type CatalogMeta } from '../lib/api';
import type { OwnedService, Provider, ProviderProfile } from '../types';
import { useAuth } from './AuthProvider';

interface CatalogApi {
  catalog: Provider[];
  meta: CatalogMeta & { signedInProviderId: string };
  profile: ProviderProfile;
  services: OwnedService[];
  loading: boolean;
  error: string | null;
  setProfile: (profile: ProviderProfile) => void;
  setServices: (services: OwnedService[]) => void;
  refresh: () => Promise<void>;
}

const CatalogContext = createContext<CatalogApi | null>(null);

const EMPTY_META: CatalogApi['meta'] = {
  categories: [],
  cities: [],
  featuredCategories: [],
  serviceCategories: [],
  categoryPlural: {},
  signedInProviderId: '',
};

const EMPTY_PROFILE: ProviderProfile = {
  name: '',
  category: '',
  desc: '',
  about: '',
  city: '',
  cities: [],
  mode: 'Atende em domicílio',
  address: '',
  whatsapp: '',
  phone: '',
  instagram: '',
  photoUrl: '',
};

function applyProfile(base: Provider, profile: ProviderProfile): Provider {
  return {
    ...base,
    name: profile.name,
    category: profile.category,
    desc: profile.desc,
    about: profile.about,
    city: profile.city,
    cities:
      profile.cities && profile.cities.length > 0
        ? profile.cities
        : [profile.city],
    mode: profile.mode,
    address: profile.address || undefined,
    whatsapp: profile.whatsapp || undefined,
    phone: profile.phone || undefined,
    instagram: profile.instagram || undefined,
    photoUrl: profile.photoUrl || undefined,
  };
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const { token, logout, setUser } = useAuth();
  const [catalog, setCatalog] = useState<Provider[]>([]);
  const [meta, setMeta] = useState<CatalogApi['meta']>(EMPTY_META);
  const [profile, setProfileState] = useState<ProviderProfile>(EMPTY_PROFILE);
  const [services, setServices] = useState<OwnedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const data = await api.bootstrap();
    setCatalog(
      data.providers.map((provider) => ({
        ...provider,
        products: provider.products ?? [],
        cities:
          provider.cities && provider.cities.length > 0
            ? provider.cities
            : [provider.city],
      })),
    );

    if (!token) {
      setMeta({ ...data.meta, signedInProviderId: '' });
      setProfileState(EMPTY_PROFILE);
      setServices([]);
      setUser(null);
      return;
    }

    try {
      const panel = await api.me();
      setUser(panel.user);
      setProfileState(panel.profile);
      setServices(panel.services);
      setMeta({ ...data.meta, signedInProviderId: panel.user.providerId });
      setCatalog((current) =>
        current.map((provider) =>
          provider.id === panel.user.providerId
            ? applyProfile(provider, panel.profile)
            : provider,
        ),
      );
    } catch {
      logout();
      setMeta({ ...data.meta, signedInProviderId: '' });
      setProfileState(EMPTY_PROFILE);
      setServices([]);
    }
  }, [logout, setUser, token]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    refresh()
      .then(() => {
        if (!cancelled) setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar o TemPro',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const setProfile = useCallback(
    (next: ProviderProfile) => {
      setProfileState(next);
      setCatalog((current) =>
        current.map((provider) =>
          provider.id === meta.signedInProviderId
            ? applyProfile(provider, next)
            : provider,
        ),
      );
    },
    [meta.signedInProviderId],
  );

  const value = useMemo<CatalogApi>(
    () => ({
      catalog,
      meta,
      profile,
      services,
      loading,
      error,
      setProfile,
      setServices,
      refresh,
    }),
    [
      catalog,
      meta,
      profile,
      services,
      loading,
      error,
      setProfile,
      refresh,
    ],
  );

  if (loading) {
    return (
      <div className="sp-container sp-block">
        <div className="sp-empty">
          <h1 className="sp-empty__title">Carregando o TemPro…</h1>
          <p className="sp-empty__text">Buscando profissionais no servidor.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sp-container sp-block">
        <div className="sp-empty">
          <h1 className="sp-empty__title">Não foi possível conectar</h1>
          <p className="sp-empty__text">
            Suba a API em <code>backend</code> (`npm run dev`) e tente de novo.
            {error ? ` ${error}.` : ''}
          </p>
          <button
            type="button"
            className="sp-btn sp-btn--primary sp-btn--md"
            onClick={() => {
              setLoading(true);
              refresh()
                .then(() => setError(null))
                .catch((err: unknown) =>
                  setError(
                    err instanceof Error
                      ? err.message
                      : 'Não foi possível carregar o TemPro',
                  ),
                )
                .finally(() => setLoading(false));
            }}
          >
            Tentar de novo
          </button>
        </div>
      </div>
    );
  }

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalogApi(): CatalogApi {
  const apiState = useContext(CatalogContext);
  if (!apiState) {
    throw new Error('useCatalogApi precisa estar dentro de <CatalogProvider>');
  }
  return apiState;
}

export function useCatalog(): Provider[] {
  return useCatalogApi().catalog;
}

export function useMeta(): CatalogApi['meta'] {
  return useCatalogApi().meta;
}
