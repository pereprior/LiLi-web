import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

import { i18n } from '#src/shared/i18n/i18n.js';

beforeEach(async () => {
  window.localStorage.clear();
  await i18n.changeLanguage('es');
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.history.replaceState(null, '', '/');
});
