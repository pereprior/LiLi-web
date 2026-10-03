import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '#src': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/auth': {
          target: environment.API_TARGET ?? 'http://localhost:3000',
        },
      },
    },
    test: {
      environment: 'jsdom',
      clearMocks: true,
      include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
      passWithNoTests: true,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.ts', 'src/**/*.tsx'],
        exclude: ['src/main.tsx', 'src/**/*.spec.ts', 'src/**/*.spec.tsx'],
        reporter: ['text', 'html'],
        reportsDirectory: './coverage',
      },
    },
  };
});
