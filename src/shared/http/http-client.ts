import { i18n } from '#src/shared/i18n/i18n.js';
import type { common } from '#src/shared/i18n/labels/en/common.js';

type HttpMessageKey = keyof typeof common.http;

export class HttpError extends Error {
  public readonly messages: string[];
  readonly #translationKey: HttpMessageKey | undefined;

  constructor(
    public readonly status: number,
    messages: string[],
    translationKey?: HttpMessageKey,
  ) {
    const key =
      translationKey ??
      (messages.length === 0 ? defaultErrorKey(status) : undefined);
    const readableMessages =
      key === undefined ? messages : [i18n.t(`common:http.${key}`)];
    super(readableMessages.join(' '));
    this.messages = readableMessages;
    this.#translationKey = key;
    this.name = 'HttpError';
  }

  public get localizedMessage(): string {
    return this.#translationKey === undefined
      ? this.message
      : i18n.t(`common:http.${this.#translationKey}`);
  }
}

function defaultErrorKey(status: number): HttpMessageKey {
  switch (status) {
    case 0:
      return 'connection';
    case 400:
      return 'invalidRequest';
    case 401:
      return 'unauthorized';
    case 403:
      return 'forbidden';
    case 404:
      return 'notFound';
    case 409:
      return 'conflict';
    default:
      return 'requestFailed';
  }
}

function readErrorMessages(value: unknown): string[] {
  if (typeof value === 'object' && value !== null && 'message' in value) {
    const message = value.message;
    const messages = typeof message === 'string' ? [message] : message;

    if (Array.isArray(messages)) {
      const readableMessages = messages.filter(
        (item): item is string =>
          typeof item === 'string' && item.trim().length > 0,
      );
      if (readableMessages.length > 0) return readableMessages;
    }
  }

  return [];
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  validate?: (value: unknown) => value is T,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body !== undefined && options.body !== null) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  try {
    const response = await fetch(path, {
      ...options,
      credentials: 'same-origin',
      headers,
    });

    if (response.status === 204 && response.ok) {
      if (validate !== undefined) {
        throw new HttpError(response.status, [], 'invalidResponse');
      }
      return undefined as T;
    }

    const text = await response.text();
    let value: unknown;
    try {
      value = JSON.parse(text) as unknown;
    } catch {
      throw new HttpError(
        response.status,
        [],
        response.ok ? 'invalidResponse' : defaultErrorKey(response.status),
      );
    }

    if (!response.ok) {
      throw new HttpError(response.status, readErrorMessages(value));
    }

    if (validate !== undefined && !validate(value)) {
      throw new HttpError(response.status, [], 'invalidResponse');
    }

    return value as T;
  } catch (error) {
    if (
      error instanceof HttpError ||
      (typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        error.name === 'AbortError') ||
      options.signal?.aborted
    ) {
      throw error;
    }

    throw new HttpError(0, []);
  }
}
