import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { app as appValencian } from '#src/shared/i18n/labels/ca-valencia/app.js';
import { auth as authValencian } from '#src/shared/i18n/labels/ca-valencia/auth.js';
import { common as commonValencian } from '#src/shared/i18n/labels/ca-valencia/common.js';
import { tasks as tasksValencian } from '#src/shared/i18n/labels/ca-valencia/tasks.js';
import { app as appEnglish } from '#src/shared/i18n/labels/en/app.js';
import { auth as authEnglish } from '#src/shared/i18n/labels/en/auth.js';
import { common as commonEnglish } from '#src/shared/i18n/labels/en/common.js';
import { tasks as tasksEnglish } from '#src/shared/i18n/labels/en/tasks.js';
import { app as appSpanish } from '#src/shared/i18n/labels/es/app.js';
import { auth as authSpanish } from '#src/shared/i18n/labels/es/auth.js';
import { common as commonSpanish } from '#src/shared/i18n/labels/es/common.js';
import { tasks as tasksSpanish } from '#src/shared/i18n/labels/es/tasks.js';

const supportedLanguages = ['en', 'es', 'ca-valencia'] as const;
type Language = (typeof supportedLanguages)[number];

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem('lili-language');
    return supportedLanguages.find((language) => language === saved) ?? 'en';
  } catch {
    return 'en';
  }
}

export const resources = {
  en: {
    app: appEnglish,
    auth: authEnglish,
    common: commonEnglish,
    tasks: tasksEnglish,
  },
  es: {
    app: appSpanish,
    auth: authSpanish,
    common: commonSpanish,
    tasks: tasksSpanish,
  },
  'ca-valencia': {
    app: appValencian,
    auth: authValencian,
    common: commonValencian,
    tasks: tasksValencian,
  },
};

export const i18n = createInstance();

function updateLanguage(language: string): void {
  const supported =
    supportedLanguages.find((value) => value === language) ?? 'en';
  document.documentElement.lang = supported;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', i18n.t('common:description'));
  try {
    localStorage.setItem('lili-language', supported);
  } catch {
    // Language changes still work when browser storage is unavailable.
  }
}

i18n.on('languageChanged', updateLanguage);

void i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  supportedLngs: [...supportedLanguages],
  load: 'currentOnly',
  defaultNS: 'common',
  initAsync: false,
  interpolation: { escapeValue: false },
});
