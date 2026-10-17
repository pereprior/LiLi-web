import { useCallback, useEffect, useRef, useState } from 'react';

import { authApi } from '#src/auth/api/auth.api.js';
import type { User } from '#src/auth/types/user.type.js';
import { HttpError } from '#src/shared/http/http-client.js';

type SessionState =
  | { status: 'checking' }
  | { status: 'authenticated'; user: User }
  | { status: 'anonymous' }
  | { status: 'error'; message: string };

type Session = {
  state: SessionState;
  checkSession: () => void;
  invalidateSession: () => void;
  logout: () => Promise<void>;
  loggingOut: boolean;
  logoutError: string | null;
};

export function useSession(): Session {
  const [state, setState] = useState<SessionState>({ status: 'checking' });
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const mounted = useRef(false);
  const requestVersion = useRef(0);
  const sessionCheck = useRef<AbortController | null>(null);
  const logoutPending = useRef(false);

  const invalidateSession = useCallback((): void => {
    requestVersion.current += 1;
    sessionCheck.current?.abort();
    sessionCheck.current = null;
    if (!mounted.current) return;

    setState({ status: 'anonymous' });
    setLogoutError(null);
  }, []);

  const checkSession = useCallback((): void => {
    if (!mounted.current || logoutPending.current) return;

    sessionCheck.current?.abort();
    const controller = new AbortController();
    sessionCheck.current = controller;
    const version = ++requestVersion.current;
    setState({ status: 'checking' });
    setLogoutError(null);

    void authApi
      .me(controller.signal)
      .then((user) => {
        if (
          mounted.current &&
          version === requestVersion.current &&
          !controller.signal.aborted
        ) {
          setState({ status: 'authenticated', user });
        }
      })
      .catch((error: unknown) => {
        if (
          !mounted.current ||
          version !== requestVersion.current ||
          controller.signal.aborted
        ) {
          return;
        }

        if (error instanceof HttpError && error.status === 401) {
          setState({ status: 'anonymous' });
        } else {
          setState({
            status: 'error',
            message:
              'No se ha podido comprobar la sesión. Revisa la conexión y vuelve a intentarlo.',
          });
        }
      })
      .finally(() => {
        if (sessionCheck.current === controller) sessionCheck.current = null;
      });
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    if (!mounted.current || logoutPending.current) return;

    logoutPending.current = true;
    sessionCheck.current?.abort();
    sessionCheck.current = null;
    const version = ++requestVersion.current;
    setLoggingOut(true);
    setLogoutError(null);

    try {
      await authApi.logout();
      if (mounted.current && version === requestVersion.current) {
        setState({ status: 'anonymous' });
      }
    } catch (error: unknown) {
      if (!mounted.current || version !== requestVersion.current) return;

      if (error instanceof HttpError && error.status === 401) {
        setState({ status: 'anonymous' });
      } else {
        setLogoutError(
          error instanceof HttpError && error.status === 403
            ? 'No se ha podido cerrar la sesión. LiLi ha rechazado la operación.'
            : 'No se ha podido cerrar la sesión. Revisa la conexión y vuelve a intentarlo.',
        );
      }
    } finally {
      logoutPending.current = false;
      if (mounted.current) setLoggingOut(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    checkSession();

    return (): void => {
      mounted.current = false;
      requestVersion.current += 1;
      sessionCheck.current?.abort();
      sessionCheck.current = null;
    };
  }, [checkSession]);

  return {
    state,
    checkSession,
    invalidateSession,
    logout,
    loggingOut,
    logoutError,
  };
}
