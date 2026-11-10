import { test, expect } from '../support/test.js';
import { functionalStep } from '../support/functional-step.js';
import { demoCredentials } from '../support/environment.js';

test.describe('OrangeHRM | Autenticación', () => {
  test('AUTH-001 | Inicio de sesión válido', async ({ page, login }) => {
    const { username, password } = demoCredentials();
    await functionalStep({
      page, name: 'Abrir el formulario de inicio de sesión',
      expected: 'Formulario Login visible.',
      run: async () => { await login.open(); await expect(login.heading).toBeVisible(); },
      observe: async () => `URL: ${page.url()}; título: ${(await login.heading.allTextContents()).join(', ')}`,
    });
    await functionalStep({
      page, name: 'Autenticarse y validar el dashboard',
      expected: 'URL /dashboard/index y encabezado Dashboard visible.',
      run: async () => {
        await login.signIn(username, password);
        await expect(page).toHaveURL(/\/dashboard\/index(?:[?#].*)?$/);
        await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
      },
      observe: async () => `URL: ${page.url()}; encabezados: ${(await page.getByRole('heading').allTextContents()).join(', ')}`,
    });
  });

  test('AUTH-002 | Inicio de sesión con contraseña incorrecta', async ({ page, login }) => {
    const { username } = demoCredentials();
    await functionalStep({
      page, name: 'Validar rechazo de contraseña incorrecta',
      expected: 'Mensaje Invalid credentials y formulario Login visible en /auth/login.',
      run: async () => {
        await login.open();
        await login.signIn(username, 'demo-invalid-password');
        await expect(login.rejection).toHaveText('Invalid credentials');
        await expect(page).toHaveURL(/\/auth\/login(?:[?#].*)?$/);
        await expect(login.heading).toBeVisible();
        await expect(login.submitButton).toBeVisible();
      },
      observe: async () => `URL: ${page.url()}; aviso: ${(await login.rejection.allTextContents()).join(', ')}; Login visible: ${await login.heading.isVisible()}`,
    });
  });

  test('AUTH-003 | Envío del formulario con campos vacíos', async ({ page, login }) => {
    await functionalStep({
      page, name: 'Validar los dos campos requeridos',
      expected: 'Username y Password vacíos; dos mensajes Required; permanece en Login.',
      run: async () => {
        await login.open();
        await login.submitEmpty();
        await expect(login.requiredMessages).toHaveCount(2);
        await expect(login.requiredMessages).toHaveText(['Required', 'Required']);
        await expect(login.username).toBeEmpty();
        await expect(login.password).toBeEmpty();
        await expect(page).toHaveURL(/\/auth\/login(?:[?#].*)?$/);
        await expect(login.heading).toBeVisible();
      },
      observe: async () => `URL: ${page.url()}; validaciones: ${(await login.requiredMessages.allTextContents()).join(', ')}; Login visible: ${await login.heading.isVisible()}`,
    });
  });
});
