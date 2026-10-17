import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LoginScreen } from '#src/auth/components/login/login-screen.js';

describe('LoginScreen', () => {
  afterEach(() => {
    cleanup();
  });

  it('starts Google access with a full page link', () => {
    render(<LoginScreen />);

    expect(
      screen
        .getByRole('link', { name: 'Entrar con Google' })
        .getAttribute('href'),
    ).toBe('/auth/google');
    expect(screen.getByText(/cuenta de Google autorizada/)).toBeTruthy();
  });

  it('shows the session check without offering login', () => {
    render(<LoginScreen checking />);

    expect(screen.getByRole('status').textContent).toContain(
      'Conectando con LiLi',
    );
    expect(
      screen.queryByRole('link', { name: 'Entrar con Google' }),
    ).toBeNull();
  });

  it('offers retry for a connection error', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<LoginScreen error="No se ha podido conectar." onRetry={onRetry} />);

    expect(screen.getByRole('alert').textContent).toContain(
      'No se ha podido conectar.',
    );
    expect(
      screen.queryByRole('link', { name: 'Entrar con Google' }),
    ).toBeNull();

    await user.click(
      screen.getByRole('button', { name: 'Volver a comprobar' }),
    );

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
