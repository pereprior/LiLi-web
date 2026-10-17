import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authApi } from '#src/auth/api/auth.api.js';
import { useSession } from '#src/auth/hooks/session/use-session.js';
import type { User } from '#src/auth/types/user.type.js';
import { HttpError } from '#src/shared/http/http-client.js';

vi.mock('#src/auth/api/auth.api.js', () => ({
  authApi: { me: vi.fn(), logout: vi.fn() },
}));

describe('useSession', () => {
  beforeEach(() => {
    vi.mocked(authApi.me).mockReset();
    vi.mocked(authApi.logout).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  describe('session checks', () => {
    it('keeps the checking state until the user is recovered', async () => {
      const pending = Promise.withResolvers<User>();
      vi.mocked(authApi.me).mockReturnValue(pending.promise);
      const { result } = renderHook(useSession);

      expect(result.current.state).toEqual({ status: 'checking' });

      await act(async () => {
        pending.resolve({ uuid: 'user-uuid', email: 'family@example.com' });
        await pending.promise;
      });

      expect(result.current.state).toEqual({
        status: 'authenticated',
        user: { uuid: 'user-uuid', email: 'family@example.com' },
      });
    });

    it('treats an expired session as anonymous', async () => {
      vi.mocked(authApi.me).mockRejectedValue(
        new HttpError(401, ['Unauthorized']),
      );
      const { result } = renderHook(useSession);

      await waitFor(() => {
        expect(result.current.state).toEqual({ status: 'anonymous' });
      });
    });

    it.each([
      ['network', new TypeError('Failed to fetch')],
      ['server', new HttpError(503, ['Unavailable'])],
    ])('offers a retry after a %s failure', async (_case, error) => {
      vi.mocked(authApi.me).mockRejectedValueOnce(error).mockResolvedValueOnce({
        uuid: 'user-uuid',
        email: 'family@example.com',
      });
      const { result } = renderHook(useSession);

      await waitFor(() => {
        expect(result.current.state).toEqual({
          status: 'error',
          message:
            'No se ha podido comprobar la sesión. Revisa la conexión y vuelve a intentarlo.',
        });
      });

      act(() => result.current.checkSession());

      expect(result.current.state).toEqual({ status: 'checking' });
      await waitFor(() => {
        expect(result.current.state.status).toBe('authenticated');
      });
    });

    it('cancels the previous check and ignores its delayed result', async () => {
      const previous = Promise.withResolvers<User>();
      vi.mocked(authApi.me)
        .mockReturnValueOnce(previous.promise)
        .mockResolvedValueOnce({
          uuid: 'current-user',
          email: 'new@example.com',
        });
      const { result } = renderHook(useSession);
      const previousSignal = vi.mocked(authApi.me).mock.calls[0]?.[0];

      act(() => result.current.checkSession());

      expect(previousSignal?.aborted).toBe(true);
      await waitFor(() => {
        expect(result.current.state).toEqual({
          status: 'authenticated',
          user: { uuid: 'current-user', email: 'new@example.com' },
        });
      });

      await act(async () => {
        previous.resolve({ uuid: 'old-user', email: 'old@example.com' });
        await previous.promise;
      });

      expect(result.current.state).toEqual({
        status: 'authenticated',
        user: { uuid: 'current-user', email: 'new@example.com' },
      });
    });

    it('does not restore a session after external invalidation', async () => {
      const pending = Promise.withResolvers<User>();
      vi.mocked(authApi.me).mockReturnValueOnce(pending.promise);
      const { result } = renderHook(useSession);
      const signal = vi.mocked(authApi.me).mock.calls[0]?.[0];

      act(() => result.current.invalidateSession());

      expect(signal?.aborted).toBe(true);
      expect(result.current.state).toEqual({ status: 'anonymous' });

      await act(async () => {
        pending.resolve({ uuid: 'user-uuid', email: 'family@example.com' });
        await pending.promise;
      });

      expect(result.current.state).toEqual({ status: 'anonymous' });
    });

    it('cancels the check when the hook unmounts', () => {
      vi.mocked(authApi.me).mockReturnValue(new Promise<User>(() => {}));
      const { unmount } = renderHook(useSession);
      const signal = vi.mocked(authApi.me).mock.calls[0]?.[0];

      unmount();

      expect(signal?.aborted).toBe(true);
    });

    it('ignores the discarded check during StrictMode initialization', async () => {
      const discarded = Promise.withResolvers<User>();
      vi.mocked(authApi.me)
        .mockReturnValueOnce(discarded.promise)
        .mockResolvedValueOnce({
          uuid: 'current-user',
          email: 'new@example.com',
        });
      const { result } = renderHook(useSession, { wrapper: StrictMode });

      await waitFor(() => {
        expect(result.current.state).toEqual({
          status: 'authenticated',
          user: { uuid: 'current-user', email: 'new@example.com' },
        });
      });

      await act(async () => {
        discarded.reject(new HttpError(401, ['Unauthorized']));
        await discarded.promise.catch(() => {});
      });

      expect(result.current.state.status).toBe('authenticated');
    });
  });

  describe('logout', () => {
    it.each([
      ['revoked', undefined],
      ['already expired', new HttpError(401, ['Unauthorized'])],
    ])('clears the session when it is %s', async (_case, error) => {
      vi.mocked(authApi.me).mockResolvedValue({
        uuid: 'user-uuid',
        email: 'family@example.com',
      });
      if (error) vi.mocked(authApi.logout).mockRejectedValue(error);
      else vi.mocked(authApi.logout).mockResolvedValue(undefined);
      const { result } = renderHook(useSession);
      await waitFor(() =>
        expect(result.current.state.status).toBe('authenticated'),
      );

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.state).toEqual({ status: 'anonymous' });
      expect(result.current.loggingOut).toBe(false);
      expect(result.current.logoutError).toBeNull();
    });

    it.each([
      [
        'rejected origin',
        new HttpError(403, ['Invalid request origin.']),
        'No se ha podido cerrar la sesión. LiLi ha rechazado la operación.',
      ],
      [
        'network',
        new TypeError('Failed to fetch'),
        'No se ha podido cerrar la sesión. Revisa la conexión y vuelve a intentarlo.',
      ],
    ])('keeps the user after a %s failure', async (_case, error, message) => {
      vi.mocked(authApi.me).mockResolvedValue({
        uuid: 'user-uuid',
        email: 'family@example.com',
      });
      vi.mocked(authApi.logout).mockRejectedValue(error);
      const { result } = renderHook(useSession);
      await waitFor(() =>
        expect(result.current.state.status).toBe('authenticated'),
      );

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.state).toEqual({
        status: 'authenticated',
        user: { uuid: 'user-uuid', email: 'family@example.com' },
      });
      expect(result.current.logoutError).toBe(message);
      expect(result.current.loggingOut).toBe(false);
    });

    it('prevents duplicate logout and checks while logout is pending', async () => {
      const pendingLogout = Promise.withResolvers<void>();
      vi.mocked(authApi.me).mockResolvedValue({
        uuid: 'user-uuid',
        email: 'family@example.com',
      });
      vi.mocked(authApi.logout).mockReturnValue(pendingLogout.promise);
      const { result } = renderHook(useSession);
      await waitFor(() =>
        expect(result.current.state.status).toBe('authenticated'),
      );
      let logout: Promise<void> | undefined;

      act(() => {
        logout = result.current.logout();
        void result.current.logout();
        result.current.checkSession();
      });

      expect(result.current.loggingOut).toBe(true);
      expect(authApi.logout).toHaveBeenCalledTimes(1);
      expect(authApi.me).toHaveBeenCalledTimes(1);

      await act(async () => {
        pendingLogout.resolve();
        await logout;
      });

      expect(result.current.state).toEqual({ status: 'anonymous' });
      expect(result.current.loggingOut).toBe(false);
    });

    it('ignores a check that finishes after logout', async () => {
      const pendingCheck = Promise.withResolvers<User>();
      vi.mocked(authApi.me).mockReturnValue(pendingCheck.promise);
      vi.mocked(authApi.logout).mockResolvedValue(undefined);
      const { result } = renderHook(useSession);

      await act(async () => {
        await result.current.logout();
      });

      await act(async () => {
        pendingCheck.resolve({
          uuid: 'user-uuid',
          email: 'family@example.com',
        });
        await pendingCheck.promise;
      });

      expect(result.current.state).toEqual({ status: 'anonymous' });
    });
  });
});
