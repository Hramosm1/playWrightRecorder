import { mkdir, rm } from 'node:fs/promises';
import { resolve, relative, isAbsolute } from 'node:path';

export default async function prepareRun() {
  const runDir = process.env.SQA_RUN_DIR;
  if (!runDir) throw new Error('Falta SQA_RUN_DIR');
  const child = relative(resolve('artifacts'), resolve(runDir));
  if (!child || child.startsWith('..') || isAbsolute(child)) {
    throw new Error('La carpeta de corrida debe estar dentro de artifacts/.');
  }
  await mkdir(runDir, { recursive: true });
  // VS Code puede reutilizar la configuración entre ejecuciones. Limpiar solo
  // salidas conocidas evita acumular resultados Allure en esa misma carpeta.
  for (const name of ['allure-results', 'allure-report', 'playwright-report', 'results.json']) {
    await rm(resolve(runDir, name), { recursive: true, force: true });
  }
}
