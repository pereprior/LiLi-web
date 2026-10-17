import type { common as englishCommon } from '#src/shared/i18n/labels/en/common.js';

export const common = {
  description: 'LiLi, tu asistente para casa.',
  http: {
    connection:
      'No se ha podido conectar con LiLi. Comprueba la conexión y vuelve a intentarlo.',
    invalidRequest: 'Revisa los datos de la petición.',
    unauthorized: 'La sesión ha caducado. Vuelve a entrar con Google.',
    forbidden:
      'La operación se ha rechazado. Comprueba la configuración del origen permitido.',
    notFound: 'La tarea ya no está disponible.',
    conflict:
      'La tarea ha cambiado o la operación entra en conflicto con su estado. Recarga y revisa los datos.',
    requestFailed:
      'LiLi no ha podido completar la petición. Vuelve a intentarlo.',
    invalidResponse: 'La respuesta del servidor no tiene el formato esperado.',
  },
  errors: {
    forbidden:
      'La operación se ha rechazado. Comprueba que el origen de la web esté permitido en la API.',
    notFound:
      'La tarea o su principal ya no están disponibles. Vuelve a la lista o recarga.',
    conflict:
      'La operación entra en conflicto con el estado actual. Hemos solicitado datos actualizados; revisa la tarea y sus subtareas antes de repetirla. {{details}}',
    unknown: 'No se ha podido completar la operación. Vuelve a intentarlo.',
  },
} satisfies typeof englishCommon;
