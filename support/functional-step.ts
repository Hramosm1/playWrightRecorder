import { test, type Page } from '@playwright/test';
import * as allure from 'allure-js-commons';

type FunctionalStep = {
  page: Page;
  name: string;
  expected: string;
  run: () => Promise<void>;
  observe?: () => Promise<string>;
};

/** Una captura por validación; se adjunta dentro del test.step aún con página viva. */
export async function functionalStep({ page, name, expected, run, observe }: FunctionalStep) {
  await test.step(name, async () => {
    let failed = false;
    let originalError: unknown;
    let observed = 'No se proporcionó una lectura de la aplicación.';
    const evidenceErrors: string[] = [];
    try {
      await run();
    } catch (error) {
      failed = true;
      originalError = error;
    }
    if (observe) {
      try { observed = await observe(); }
      catch { observed = 'No fue posible leer la aplicación.'; }
    }
    // El error de aserción aporta recibido/esperado cuando la lectura no alcanza.
    const assertion = failed ? (originalError instanceof Error ? originalError.message : String(originalError)) : undefined;
    try {
      const screenshot = await page.screenshot({
        fullPage: true, timeout: 5_000,
        mask: [page.locator('input[type="password"], input[name="password"]'), page.getByText(/^Password\s*:/)],
      });
      // La API de Allure usa test.info().attach dentro del paso vigente. Con las
      // versiones fijadas, step.attach pierde el padre en el adaptador Allure.
      await allure.attachment('Evidencia funcional', screenshot, 'image/png');
    } catch (error) {
      evidenceErrors.push(`Captura o adjunto no disponible: ${error instanceof Error ? error.message : String(error)}`);
    }
    try {
      await allure.attachment('Resultado esperado y observado',
        JSON.stringify({ expected, observed, assertion, evidenceErrors }, null, 2), 'application/json');
    } catch (error) {
      evidenceErrors.push(`No se pudo adjuntar el resultado: ${String(error)}`);
    }
    // No ocultar defectos funcionales si también falla la evidencia.
    if (failed) throw originalError;
    if (evidenceErrors.length) throw new Error(evidenceErrors.join('\n'));
  });
}
