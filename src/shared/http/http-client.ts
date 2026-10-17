export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly messages: string[],
  ) {
    super(messages.join(' ') || defaultErrorMessage(status));
    this.name = 'HttpError';
  }
}

function defaultErrorMessage(status: number): string {
  switch (status) {
    case 0:
      return 'No se ha podido conectar con LiLi. Comprueba la conexión y vuelve a intentarlo.';
    case 400:
      return 'Revisa los datos de la petición.';
    case 401:
      return 'La sesión ha caducado. Vuelve a entrar con Google.';
    case 403:
      return 'La operación se ha rechazado. Comprueba la configuración del origen permitido.';
    case 404:
      return 'La tarea ya no está disponible.';
    case 409:
      return 'La tarea ha cambiado o la operación entra en conflicto con su estado. Recarga y revisa los datos.';
    default:
      return 'LiLi no ha podido completar la petición. Vuelve a intentarlo.';
  }
}

function readErrorMessages(value: unknown, status: number): string[] {
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

  return [defaultErrorMessage(status)];
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
        throw new HttpError(response.status, [
          'La respuesta del servidor no tiene el formato esperado.',
        ]);
      }
      return undefined as T;
    }

    const text = await response.text();
    let value: unknown;
    try {
      value = JSON.parse(text) as unknown;
    } catch {
      throw new HttpError(response.status, [
        response.ok
          ? 'La respuesta del servidor no tiene el formato esperado.'
          : defaultErrorMessage(response.status),
      ]);
    }

    if (!response.ok) {
      throw new HttpError(
        response.status,
        readErrorMessages(value, response.status),
      );
    }

    if (validate !== undefined && !validate(value)) {
      throw new HttpError(response.status, [
        'La respuesta del servidor no tiene el formato esperado.',
      ]);
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

    throw new HttpError(0, [defaultErrorMessage(0)]);
  }
}
