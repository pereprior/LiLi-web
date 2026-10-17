import { describe, expect, it } from 'vitest';

import { getErrorMessage } from '#src/shared/http/error-message.js';
import { HttpError } from '#src/shared/http/http-client.js';

describe('getErrorMessage', () => {
  it('keeps the readable message from an HTTP error', () => {
    expect(getErrorMessage(new HttpError(400, ['Revisa el nombre.']))).toBe(
      'Revisa el nombre.',
    );
  });

  it('explains a rejected origin without claiming that the session expired', () => {
    expect(
      getErrorMessage(new HttpError(403, ['Invalid request origin.'])),
    ).toBe(
      'La operación se ha rechazado. Comprueba que el origen de la web esté permitido en la API.',
    );
  });

  it.each([null, 'unexpected failure', new Error('   ')])(
    'uses a readable fallback for unknown errors %j',
    (error) => {
      expect(getErrorMessage(error)).toBe(
        'No se ha podido completar la operación. Vuelve a intentarlo.',
      );
    },
  );
});
