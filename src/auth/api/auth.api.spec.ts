import { afterEach, describe, expect, it, vi } from 'vitest';

import { authApi } from '#src/auth/api/auth.api.js';
import { HttpError } from '#src/shared/http/http-client.js';

describe('authApi', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('recovers the public user without caching the session check', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ uuid: 'user-uuid', email: 'family@example.com' }),
        ),
      );
    vi.stubGlobal('fetch', fetch);
    const controller = new AbortController();

    const user = await authApi.me(controller.signal);

    expect(user).toEqual({ uuid: 'user-uuid', email: 'family@example.com' });
    expect(fetch).toHaveBeenCalledWith(
      '/auth/me',
      expect.objectContaining({
        cache: 'no-store',
        signal: controller.signal,
        credentials: 'same-origin',
      }),
    );
  });

  it('rejects a response without the required public user fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof globalThis.fetch>()
        .mockResolvedValue(
          new Response(JSON.stringify({ email: 'family@example.com' })),
        ),
    );

    await expect(authApi.me()).rejects.toEqual(
      new HttpError(200, [
        'La respuesta del servidor no tiene el formato esperado.',
      ]),
    );
  });

  it('logs out with a bodyless POST and accepts the empty response', async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetch);

    await expect(authApi.logout()).resolves.toBeUndefined();

    expect(fetch).toHaveBeenCalledWith(
      '/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
      }),
    );
    const [, options] = fetch.mock.calls[0] ?? [];
    expect(options?.body).toBeUndefined();
  });
});
