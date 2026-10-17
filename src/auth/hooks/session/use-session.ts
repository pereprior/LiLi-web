import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { authApi } from '#src/auth/api/auth.api.js';
import type { User } from '#src/auth/types/user.type.js';
import { HttpError } from '#src/shared/errors/http.error.js';

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

type InternalSessionState =
  Exclude<SessionState, { status: 'error' }> | { status: 'error' };

type LogoutError = 'logoutRejected' | 'logoutConnection';

export function useSession(): Session {
  const { t } = useTranslation('auth');
  const [state, setState] = useState<InternalSessionState>({
    status: 'checking',
  });
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<LogoutError | null>(null);
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
            ? 'logoutRejected'
            : 'logoutConnection',
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
    state:
      state.status === 'error'
        ? { status: 'error', message: t('errors.session') }
        : state,
    checkSession,
    invalidateSession,
    logout,
    loggingOut,
    logoutError: logoutError === null ? null : t(`errors.${logoutError}`),
  };
}
