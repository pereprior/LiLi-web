import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '#src/app/app.js';
import { authApi } from '#src/auth/api/auth.api.js';
import type { User } from '#src/auth/types/user.type.js';
import { HttpError } from '#src/shared/http/http-client.js';

vi.mock('#src/auth/api/auth.api.js', () => ({
  authApi: { me: vi.fn(), logout: vi.fn() },
}));

vi.mock('#src/tasks/components/page/tasks-page.js', () => ({
  TasksPage: ({
    email,
    onUnauthorized,
  }: {
    email: string;
    onUnauthorized: () => void;
  }): ReactElement => (
    <section>
      <h1>Tus tareas</h1>
      <p>Tareas de {email}</p>
      <button onClick={onUnauthorized}>Simular sesión caducada</button>
    </section>
  ),
}));

function CurrentLocation(): ReactElement {
  const location = useLocation();

  return (
    <output aria-label="Ruta actual">
      {location.pathname}
      {location.search}
    </output>
  );
}

function renderApp(initialEntry: string): void {
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
      <CurrentLocation />
    </MemoryRouter>,
  );
}

describe('App', () => {
  beforeEach(() => {
    vi.mocked(authApi.me).mockReset();
    vi.mocked(authApi.logout).mockReset();
  });

  describe('session checks', () => {
    it.each(['/?login=denied', '/login?login=denied', '/unknown'])(
      'keeps %s while checking the session without rendering tasks',
      (initialEntry) => {
        const pending = Promise.withResolvers<User>();
        vi.mocked(authApi.me).mockReturnValue(pending.promise);

        renderApp(initialEntry);

        expect(
          within(screen.getByRole('main')).getByRole('status'),
        ).toHaveTextContent('Conectando con LiLi');
        expect(screen.getByLabelText('Ruta actual')).toHaveTextContent(
          initialEntry,
        );
        expect(
          screen.queryByRole('heading', { name: 'Tus tareas' }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole('link', { name: 'Entrar con Google' }),
        ).not.toBeInTheDocument();
      },
    );

    it('keeps the requested URL and offers retry after a failed session check', async () => {
      vi.mocked(authApi.me).mockRejectedValue(new TypeError('Failed to fetch'));

      renderApp('/?login=denied');

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'No se ha podido comprobar la sesión. Revisa la conexión y vuelve a intentarlo.',
      );
      expect(
        screen.getByRole('button', { name: 'Volver a comprobar' }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Ruta actual')).toHaveTextContent(
        '/?login=denied',
      );
      expect(
        screen.queryByRole('heading', { name: 'Tus tareas' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('routing', () => {
    it('redirects an anonymous user to login while preserving the query string', async () => {
      vi.mocked(authApi.me).mockRejectedValue(
        new HttpError(401, ['Unauthorized']),
      );

      renderApp('/?login=denied');

      expect(
        await screen.findByRole('link', { name: 'Entrar con Google' }),
      ).toHaveAttribute('href', '/auth/google');
      expect(screen.getByLabelText('Ruta actual')).toHaveTextContent(
        '/login?login=denied',
      );
      expect(
        screen.queryByRole('heading', { name: 'Tus tareas' }),
      ).not.toBeInTheDocument();
    });

    it('opens tasks from login for an authenticated user while preserving the query string', async () => {
      vi.mocked(authApi.me).mockResolvedValue({
        uuid: 'user-uuid',
        email: 'family@example.com',
      });

      renderApp('/login?login=complete');

      expect(
        await screen.findByRole('heading', { name: 'Tus tareas' }),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Tareas de family@example.com'),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Ruta actual')).toHaveTextContent(
        '/?login=complete',
      );
      expect(authApi.me).toHaveBeenCalledTimes(1);
    });

    it('redirects an unknown route to the task page', async () => {
      vi.mocked(authApi.me).mockResolvedValue({
        uuid: 'user-uuid',
        email: 'family@example.com',
      });

      renderApp('/unknown?discarded=true');

      expect(
        await screen.findByRole('heading', { name: 'Tus tareas' }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Ruta actual')).toHaveTextContent(/^\/$/);
    });
  });

  describe('session termination', () => {
    it('removes tasks and redirects to login after logout', async () => {
      vi.mocked(authApi.me).mockResolvedValue({
        uuid: 'user-uuid',
        email: 'family@example.com',
      });
      vi.mocked(authApi.logout).mockResolvedValue(undefined);
      const user = userEvent.setup();
      renderApp('/?login=complete');
      await screen.findByRole('heading', { name: 'Tus tareas' });

      await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

      expect(
        await screen.findByRole('link', { name: 'Entrar con Google' }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Ruta actual')).toHaveTextContent(
        '/login?login=complete',
      );
      expect(
        screen.queryByRole('heading', { name: 'Tus tareas' }),
      ).not.toBeInTheDocument();
      expect(authApi.logout).toHaveBeenCalledTimes(1);
    });

    it('removes tasks and redirects to login when tasks invalidate the session', async () => {
      vi.mocked(authApi.me).mockResolvedValue({
        uuid: 'user-uuid',
        email: 'family@example.com',
      });
      const user = userEvent.setup();
      renderApp('/');
      await screen.findByRole('heading', { name: 'Tus tareas' });

      await user.click(
        screen.getByRole('button', { name: 'Simular sesión caducada' }),
      );

      expect(
        await screen.findByRole('link', { name: 'Entrar con Google' }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/login');
      expect(
        screen.queryByRole('heading', { name: 'Tus tareas' }),
      ).not.toBeInTheDocument();
    });
  });
});
