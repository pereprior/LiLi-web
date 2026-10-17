import 'i18next';

import type { resources } from '#src/shared/i18n/i18n.js';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: (typeof resources)['en'];
  }
}
