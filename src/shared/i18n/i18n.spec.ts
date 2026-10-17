import { describe, expect, it, vi } from 'vitest';

import { getInitialLanguage, i18n } from '#src/shared/i18n/i18n.js';

describe('i18n', () => {
  describe('language preferences', () => {
    it('starts in English without a saved preference', () => {
      localStorage.clear();

      expect(getInitialLanguage()).toBe('en');
    });

    it('restores a saved Valencian preference', () => {
      localStorage.setItem('lili-language', 'ca-valencia');

      expect(getInitialLanguage()).toBe('ca-valencia');
    });

    it('falls back to English for an unsupported saved language', () => {
      localStorage.setItem('lili-language', 'fr');

      expect(getInitialLanguage()).toBe('en');
    });

    it('keeps language selection working when browser storage is blocked', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('Storage is blocked', 'SecurityError');
      });
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('Storage is blocked', 'SecurityError');
      });

      expect(getInitialLanguage()).toBe('en');
      await i18n.changeLanguage('ca-valencia');

      expect(i18n.t('auth:signIn')).toBe('Entra amb Google');
      expect(document.documentElement.lang).toBe('ca-valencia');
    });

    it('uses the English fallback for an unsupported requested language', async () => {
      await i18n.changeLanguage('fr');

      expect(i18n.t('auth:signIn')).toBe('Sign in with Google');
      expect(document.documentElement.lang).toBe('en');
    });
  });

  describe('plural task counts', () => {
    it.each([
      ['en', 0, '0 tasks'],
      ['en', 1, '1 task'],
      ['en', 2, '2 tasks'],
      ['es', 0, '0 tareas'],
      ['es', 1, '1 tarea'],
      ['es', 2, '2 tareas'],
      ['ca-valencia', 0, '0 tasques'],
      ['ca-valencia', 1, '1 tasca'],
      ['ca-valencia', 2, '2 tasques'],
    ])('renders %s with count %i as %s', async (language, count, expected) => {
      await i18n.changeLanguage(language);

      expect(i18n.t('tasks:page.count', { count })).toBe(expected);
    });
  });
});
