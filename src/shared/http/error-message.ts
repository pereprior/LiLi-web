import { HttpError } from '#src/shared/errors/http.error.js';
import { i18n } from '#src/shared/i18n/i18n.js';

export function getErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 403) return i18n.t('common:errors.forbidden');
    if (error.status === 404) return i18n.t('common:errors.notFound');
    if (error.status === 409)
      return i18n.t('common:errors.conflict', {
        details: error.localizedMessage,
      });
    return error.localizedMessage;
  }
  if (error instanceof Error && error.message.trim()) return error.message;

  return i18n.t('common:errors.unknown');
}
