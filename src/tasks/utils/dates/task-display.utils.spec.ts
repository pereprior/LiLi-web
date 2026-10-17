import { describe, expect, it } from 'vitest';

import { i18n } from '#src/shared/i18n/i18n.js';
import { formatTaskDate } from '#src/tasks/utils/dates/task-display.utils.js';

describe('formatTaskDate', () => {
  it.each([
    { language: 'en', time: null, expected: '10/15/2026' },
    { language: 'en', time: '00:00', expected: '10/15/2026 · 00:00' },
    { language: 'es', time: null, expected: '15/10/2026' },
    { language: 'es', time: '00:00', expected: '15/10/2026 · 00:00' },
    { language: 'ca-valencia', time: null, expected: '15/10/2026' },
    { language: 'ca-valencia', time: '00:00', expected: '15/10/2026 · 00:00' },
  ])(
    'formats a Madrid calendar date in $language with time $time',
    async ({ language, time, expected }) => {
      await i18n.changeLanguage(language);

      expect(formatTaskDate({ date: '2026-10-15', time })).toBe(expected);
    },
  );

  it.each([
    { language: 'en', expected: 'No date' },
    { language: 'es', expected: 'Sin fecha' },
    { language: 'ca-valencia', expected: 'Sense data' },
  ])(
    'translates an absent date in $language',
    async ({ language, expected }) => {
      await i18n.changeLanguage(language);

      expect(formatTaskDate(null)).toBe(expected);
    },
  );
});
