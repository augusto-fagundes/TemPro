import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { api, getToken, setToken as persistToken } from '../lib/api';
import type { AuthUser } from '../types';

interface AuthApi {
  token: string | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    city?: string;
    cities?: string[];
    category?: string;
  }) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<AuthUser | null>(null);

  const applySession = useCallback((nextToken: string, nextUser: AuthUser) => {
    persistToken(nextToken);
    setTokenState(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await api.login(email, password);
      applySession(session.token, session.user);
    },
    [applySession],
  );

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      city?: string;
      cities?: string[];
      category?: string;
    }) => {
      const session = await api.register(input);
      applySession(session.token, session.user);
    },
    [applySession],
  );

  const logout = useCallback(() => {
    persistToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthApi>(
    () => ({ token, user, login, register, logout, setUser }),
    [token, user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const apiState = useContext(AuthContext);
  if (!apiState) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return apiState;
}
