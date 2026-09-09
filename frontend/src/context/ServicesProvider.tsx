import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { api } from '../lib/api';
import type { OwnedService } from '../types';
import { useCatalogApi } from './CatalogProvider';

export type ServiceDraft = Omit<OwnedService, 'id'>;

interface ServicesApi {
  services: OwnedService[];
  add: (service: ServiceDraft) => Promise<void>;
  update: (id: number, patch: Partial<ServiceDraft>) => Promise<void>;
  remove: (id: number) => Promise<void>;
  find: (id: number) => OwnedService | undefined;
}

const ServicesContext = createContext<ServicesApi | null>(null);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const { services, setServices, refresh } = useCatalogApi();

  const add = useCallback(
    async (service: ServiceDraft) => {
      const created = await api.createService(service);
      setServices(services.concat(created));
      await refresh();
    },
    [refresh, services, setServices],
  );

  const update = useCallback(
    async (id: number, patch: Partial<ServiceDraft>) => {
      const current = services.find((service) => service.id === id);
      if (!current) return;
      const saved = await api.updateService(id, { ...current, ...patch });
      setServices(services.map((service) => (service.id === id ? saved : service)));
      await refresh();
    },
    [refresh, services, setServices],
  );

  const remove = useCallback(
    async (id: number) => {
      await api.deleteService(id);
      setServices(services.filter((service) => service.id !== id));
      await refresh();
    },
    [refresh, services, setServices],
  );

  const value = useMemo<ServicesApi>(
    () => ({
      services,
      add,
      update,
      remove,
      find: (id) => services.find((service) => service.id === id),
    }),
    [services, add, update, remove],
  );

  return (
    <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>
  );
}

export function useServices() {
  const apiState = useContext(ServicesContext);
  if (!apiState) {
    throw new Error('useServices precisa estar dentro de <ServicesProvider>');
  }
  return apiState;
}
