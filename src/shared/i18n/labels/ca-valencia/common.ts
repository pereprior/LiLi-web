import type { common as englishCommon } from '#src/shared/i18n/labels/en/common.js';

export const common = {
  description: 'LiLi, el teu assistent per a casa.',
  http: {
    connection:
      'No s’ha pogut connectar amb LiLi. Comprova la connexió i torna-ho a intentar.',
    invalidRequest: 'Revisa les dades de la petició.',
    unauthorized: 'La sessió ha caducat. Torna a entrar amb Google.',
    forbidden:
      'S’ha rebutjat l’operació. Comprova la configuració de l’origen permés.',
    notFound: 'La tasca ja no està disponible.',
    conflict:
      'La tasca ha canviat o l’operació entra en conflicte amb el seu estat. Recarrega i revisa les dades.',
    requestFailed:
      'LiLi no ha pogut completar la petició. Torna-ho a intentar.',
    invalidResponse: 'La resposta del servidor no té el format esperat.',
  },
  errors: {
    forbidden:
      'S’ha rebutjat l’operació. Comprova que l’origen de la web estiga permés en l’API.',
    notFound:
      'La tasca o la seua principal ja no estan disponibles. Torna a la llista o recarrega.',
    conflict:
      'L’operació entra en conflicte amb l’estat actual. Hem demanat dades actualitzades; revisa la tasca i les seues subtasques abans de repetir-la. {{details}}',
    unknown: 'No s’ha pogut completar l’operació. Torna-ho a intentar.',
  },
} satisfies typeof englishCommon;
