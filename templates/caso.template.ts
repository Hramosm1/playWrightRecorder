// Copiar a tests/mi-caso.spec.ts. Esta plantilla NO se descubre como prueba.
import { test, expect } from '../support/test.js';
import { functionalStep } from '../support/functional-step.js';

test.describe('OrangeHRM | Autenticación', () => {
  test('AUTH-004 | Nombre funcional del caso', async ({ page, login }) => {
    await functionalStep({
      page,
      name: 'Abrir y validar el formulario Login',
      expected: 'El encabezado Login está visible.',
      run: async () => {
        await login.open(); // Reutilizar; grabar solo acciones nuevas.
        await expect(login.heading).toBeVisible(); // Comprobación de negocio en test.
      },
      observe: async () => `URL: ${page.url()}; Login visible: ${await login.heading.isVisible()}`,
    }); // Captura automática, también si falla la aserción.
  });
});
