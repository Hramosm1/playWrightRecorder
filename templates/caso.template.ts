// Copiar a tests/mi-caso.spec.ts. Esta plantilla NO se descubre como prueba.
import { test, expect } from '../support/test.js';
import { functionalStep } from '../support/functional-step.js';

test.describe('Automation Testing | Registro', () => {
  test('REG-004 | Nombre funcional del caso', async ({ page }) => {
    const heading = page.getByRole('heading', { name: 'Register', exact: true });
    await functionalStep({
      page,
      name: 'Abrir y validar el formulario de registro',
      expected: 'El encabezado Register está visible.',
      run: async () => {
        // Pegar aquí las acciones grabadas con page. Ajustar URL, localizadores y datos.
        await page.goto('/Register.html');

        // Agregar aquí las aserciones que determinan si el paso pasa.
        await expect(heading).toBeVisible();
      },
      observe: async () => `URL: ${page.url()}; Register visible: ${await heading.isVisible()}`,
    }); // Captura automática, también si falla la aserción.
  });
});
