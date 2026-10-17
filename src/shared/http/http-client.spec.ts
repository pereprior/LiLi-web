import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpError, request } from '#src/shared/http/http-client.js';

describe('request', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('successful responses', () => {
    it('keeps same-origin cookies and sends JSON with the caller signal', async () => {
      const controller = new AbortController();
      fetchMock.mockResolvedValue(Response.json({ success: true }));

      const result = await request<{ success: boolean }>('/tasks', {
        method: 'POST',
        body: JSON.stringify({ name: 'Comprar comida' }),
        signal: controller.signal,
        headers: { 'X-Request-Id': 'test-request' },
      });

      expect(result).toEqual({ success: true });
      expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/tasks', {
        method: 'POST',
        body: '{"name":"Comprar comida"}',
        signal: controller.signal,
        credentials: 'same-origin',
        headers: new Headers({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Request-Id': 'test-request',
        }),
      });
    });

    it('accepts logout with no response body', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      await expect(
        request<void>('/auth/logout', { method: 'POST' }),
      ).resolves.toBeUndefined();
    });

    it.each(['', '<!doctype html><title>Vite</title>', '{broken'])(
      'rejects a successful non-JSON body %j with a readable error',
      async (body) => {
        fetchMock.mockResolvedValue(new Response(body, { status: 200 }));

        await expect(request('/tasks')).rejects.toEqual(
          new HttpError(200, [
            'La respuesta del servidor no tiene el formato esperado.',
          ]),
        );
      },
    );

    it('rejects JSON that fails the feature response validator', async () => {
      fetchMock.mockResolvedValue(Response.json({ user: 'unexpected' }));

      await expect(
        request(
          '/auth/me',
          {},
          (value): value is string => typeof value === 'string',
        ),
      ).rejects.toEqual(
        new HttpError(200, [
          'La respuesta del servidor no tiene el formato esperado.',
        ]),
      );
    });

    it('rejects no-content responses when a feature expects JSON', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      await expect(
        request('/tasks', {}, (value): value is unknown[] =>
          Array.isArray(value),
        ),
      ).rejects.toEqual(
        new HttpError(204, [
          'La respuesta del servidor no tiene el formato esperado.',
        ]),
      );
    });
  });

  describe('HTTP errors', () => {
    it.each([
      ['Task not found.', ['Task not found.']],
      [
        ['name must be a string', 'priority must be valid'],
        ['name must be a string', 'priority must be valid'],
      ],
    ])(
      'keeps backend messages %j and the actual HTTP status',
      async (message, messages) => {
        fetchMock.mockResolvedValue(
          Response.json({ statusCode: 400, message }, { status: 409 }),
        );

        const result = request('/tasks');

        await expect(result).rejects.toMatchObject({ status: 409, messages });
        await expect(result).rejects.toHaveProperty(
          'message',
          messages.join(' '),
        );
      },
    );

    it.each(['', '<html>Bad Gateway</html>', '{"message":42}'])(
      'does not expose an unreadable error body %j',
      async (body) => {
        fetchMock.mockResolvedValue(new Response(body, { status: 403 }));

        await expect(request('/tasks')).rejects.toEqual(
          new HttpError(403, [
            'La operación se ha rechazado. Comprueba la configuración del origen permitido.',
          ]),
        );
      },
    );
  });

  describe('network and cancellation', () => {
    it('reports network failures without retrying a write', async () => {
      fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(
        request('/tasks', { method: 'POST', body: '{"name":"Comida"}' }),
      ).rejects.toEqual(
        new HttpError(0, [
          'No se ha podido conectar con LiLi. Comprueba la conexión y vuelve a intentarlo.',
        ]),
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('preserves AbortError for cancelled reads', async () => {
      const abort = new DOMException('Cancelled', 'AbortError');
      fetchMock.mockRejectedValue(abort);

      await expect(request('/tasks')).rejects.toBe(abort);
    });
  });
});
