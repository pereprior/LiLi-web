import '#src/shared/i18n/i18n.js';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import { App } from '#src/app/app.js';
import { theme } from '#src/app/theme.js';

const container = document.getElementById('root');
if (!container) throw new Error('The application root element is missing.');

createRoot(container).render(
  <StrictMode>
    <ThemeProvider
      theme={theme}
      defaultMode="system"
      modeStorageKey="lili-color-mode"
      colorSchemeStorageKey="lili-color-scheme"
      disableTransitionOnChange
      noSsr
    >
      <CssBaseline enableColorScheme />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
