import { test, expect } from '../support/test.js';
import { functionalStep } from '../support/functional-step.js';

test.describe('Automation Testing | Registro', () => {
  test('REG-001 | Campos requeridos impiden enviar el formulario vacío', async ({ page }) => {
    const firstName = page.getByPlaceholder('First Name', { exact: true });
    const lastName = page.getByPlaceholder('Last Name', { exact: true });
    await functionalStep({
      page,
      name: 'Validar campos requeridos al pulsar Submit',
      expected: 'El navegador marca ambos nombres como requeridos y mantiene abierto el formulario.',
      run: async () => {
        await page.goto('/Register.html', { waitUntil: 'domcontentloaded' });
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        await expect(firstName).toBeFocused();
        await expect.poll(() => firstName.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
        await expect.poll(() => lastName.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
        await expect(page).toHaveURL(/\/Register\.html(?:[?#].*)?$/);
      },
      observe: async () => `URL: ${page.url()}; mensaje del navegador: ${await firstName.evaluate((input: HTMLInputElement) => input.validationMessage)}`,
    });
  });

  test('REG-002 | El campo de correo distingue formatos inválidos y válidos', async ({ page }) => {
    const email = page.locator('input[type="email"]');
    await functionalStep({
      page,
      name: 'Validar el formato del correo',
      expected: 'Un correo sin arroba se marca inválido y un correo de ejemplo con formato correcto se acepta.',
      run: async () => {
        await page.goto('/Register.html', { waitUntil: 'domcontentloaded' });
        await email.fill('correo-invalido');
        await expect(page.locator('input[type="email"]:invalid')).toBeVisible();
        await email.fill('tester@example.test');
        await expect(page.locator('input[type="email"]:valid')).toBeVisible();
      },
      observe: async () => `Correo final: ${await email.inputValue()}; formato válido: ${await email.evaluate((input: HTMLInputElement) => input.validity.valid)}`,
    });
  });

  test('REG-003 | Los pasatiempos pueden seleccionarse de forma independiente', async ({ page }) => {
    // El demo muestra el texto de los pasatiempos junto a las casillas, sin etiqueta asociada.
    const cricket = page.locator('#checkbox1');
    const movies = page.locator('#checkbox2');
    await functionalStep({
      page,
      name: 'Seleccionar dos pasatiempos y desmarcar uno',
      expected: 'Ambos pasatiempos se pueden marcar y desmarcar Cricket no afecta Movies.',
      run: async () => {
        await page.goto('/Register.html', { waitUntil: 'domcontentloaded' });
        await cricket.check();
        await movies.check();
        await expect(cricket).toBeChecked();
        await expect(movies).toBeChecked();
        await cricket.uncheck();
        await expect(cricket).not.toBeChecked();
        await expect(movies).toBeChecked();
      },
      observe: async () => `Cricket: ${await cricket.isChecked()}; Movies: ${await movies.isChecked()}`,
    });
  });
});
