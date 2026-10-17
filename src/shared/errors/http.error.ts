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
