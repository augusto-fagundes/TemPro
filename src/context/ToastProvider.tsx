import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { Toast } from '../components/Toast';

const TOAST_MS = 2600;

const ToastContext = createContext<((message: string) => void) | null>(null);

/**
 * One transient message at a time, mounted once at the app root so any route
 * can raise one without threading a callback through the tree.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((next: string) => {
    window.clearTimeout(timer.current);
    setMessage(next);
    timer.current = window.setTimeout(() => setMessage(null), TOAST_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast message={message} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return show;
}
