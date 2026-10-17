import { expect, test } from '@playwright/test';

test.describe('language preferences', () => {
  test.use({ locale: 'es-ES' });

  test('starts in English and remembers Spanish and Valencian selections', async ({
    page,
  }) => {
    await page.route('**/auth/me', (route) =>
      route.fulfill({ status: 401, json: { message: 'Unauthorized' } }),
    );

    await page.goto('/login');

    await expect(
      page.getByRole('link', { name: 'Sign in with Google' }),
    ).toBeVisible();
    await expect(
      page.getByRole('combobox', { name: 'Language', exact: true }),
    ).toHaveValue('en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await page
      .getByRole('combobox', { name: 'Language', exact: true })
      .selectOption('es');

    await expect(
      page.getByRole('link', { name: 'Entrar con Google' }),
    ).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    await page.reload();

    await expect(
      page.getByRole('link', { name: 'Entrar con Google' }),
    ).toBeVisible();
    await expect(
      page.getByRole('combobox', { name: 'Idioma', exact: true }),
    ).toHaveValue('es');

    await page
      .getByRole('combobox', { name: 'Idioma', exact: true })
      .selectOption('ca-valencia');

    await expect(
      page.getByRole('link', { name: 'Entra amb Google' }),
    ).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'ca-valencia');

    await page.reload();

    await expect(
      page.getByRole('link', { name: 'Entra amb Google' }),
    ).toBeVisible();
    await expect(
      page.getByRole('combobox', { name: 'Idioma', exact: true }),
    ).toHaveValue('ca-valencia');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ca-valencia');
  });
});
