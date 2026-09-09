import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { api } from '../lib/api';
import type { ProviderProfile } from '../types';
import { useCatalogApi } from './CatalogProvider';

interface ProfileApi {
  profile: ProviderProfile;
  update: (patch: Partial<ProviderProfile>) => Promise<void>;
  reset: () => Promise<void>;
}

const ProfileContext = createContext<ProfileApi | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { profile, setProfile, refresh } = useCatalogApi();

  const update = useCallback(
    async (patch: Partial<ProviderProfile>) => {
      const next = await api.updateProfile({ ...profile, ...patch });
      setProfile(next);
    },
    [profile, setProfile],
  );

  const reset = useCallback(async () => {
    const next = await api.resetProfile();
    setProfile(next);
    await refresh();
  }, [refresh, setProfile]);

  const value = useMemo<ProfileApi>(
    () => ({ profile, update, reset }),
    [profile, update, reset],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const apiState = useContext(ProfileContext);
  if (!apiState) {
    throw new Error('useProfile precisa estar dentro de <ProfileProvider>');
  }
  return apiState;
}

export { useCatalog } from './CatalogProvider';
