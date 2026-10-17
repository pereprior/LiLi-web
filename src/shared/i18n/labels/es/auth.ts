import type { auth as englishAuth } from '#src/shared/i18n/labels/en/auth.js';

export const auth = {
  title: 'Un poco de orden para casa',
  description: 'Tus tareas, planes y recordatorios, en un mismo lugar.',
  checkingSession: 'Comprobando sesión',
  connecting: 'Conectando con LiLi…',
  retry: 'Volver a comprobar',
  signIn: 'Entrar con Google',
  privateSpace:
    'LiLi es un espacio privado para casa. Accede con una cuenta de Google autorizada.',
  errors: {
    session:
      'No se ha podido comprobar la sesión. Revisa la conexión y vuelve a intentarlo.',
    logoutRejected:
      'No se ha podido cerrar la sesión. LiLi ha rechazado la operación.',
    logoutConnection:
      'No se ha podido cerrar la sesión. Revisa la conexión y vuelve a intentarlo.',
  },
} satisfies typeof englishAuth;
