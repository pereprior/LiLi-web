import { HttpError } from '#src/shared/http/http-client.js';

export function getErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 403)
      return 'La operación se ha rechazado. Comprueba que el origen de la web esté permitido en la API.';
    if (error.status === 404)
      return 'La tarea o su principal ya no están disponibles. Vuelve a la lista o recarga.';
    if (error.status === 409)
      return `La operación entra en conflicto con el estado actual. Hemos solicitado datos actualizados; revisa la tarea y sus subtareas antes de repetirla. ${error.message}`;
  }
  if (error instanceof Error && error.message.trim()) return error.message;

  return 'No se ha podido completar la operación. Vuelve a intentarlo.';
}
