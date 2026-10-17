import type { auth as englishAuth } from '#src/shared/i18n/labels/en/auth.js';

export const auth = {
  title: 'Un poc d’ordre per a casa',
  description: 'Les teues tasques, plans i recordatoris, en un mateix lloc.',
  checkingSession: 'Comprovant la sessió',
  connecting: 'Connectant amb LiLi…',
  retry: 'Torna a comprovar',
  signIn: 'Entra amb Google',
  privateSpace:
    'LiLi és un espai privat per a casa. Accedix amb un compte de Google autoritzat.',
  errors: {
    session:
      'No s’ha pogut comprovar la sessió. Revisa la connexió i torna-ho a intentar.',
    logoutRejected:
      'No s’ha pogut tancar la sessió. LiLi ha rebutjat l’operació.',
    logoutConnection:
      'No s’ha pogut tancar la sessió. Revisa la connexió i torna-ho a intentar.',
  },
} satisfies typeof englishAuth;
