// Verifica artefactos, navega el HTML autónomo sin red y revisa el HTML nativo.
import assert from 'node:assert/strict';
import { readFile, readdir, mkdtemp, copyFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import { chromium, expect } from '@playwright/test';
import { latestRun } from './report.mjs';

const runDir = resolve(process.argv[2] || await latestRun());
const resultDir = join(runDir, 'allure-results');
const files = (await readdir(resultDir)).filter(f => f.endsWith('-result.json'));
assert.ok(files.length, 'Sin resultados Allure');
const attachmentTree = step => [...(step.attachments || []), ...(step.steps || []).flatMap(attachmentTree)];
const results = await Promise.all(files.map(async file => JSON.parse(await readFile(join(resultDir, file), 'utf8'))));
for (const result of results) {
  const steps = result.steps.filter(s => s.uuid); // Los test.step funcionales.
  assert.ok(steps.length, `${result.name}: sin paso funcional`);
  for (const step of steps) {
    const attachments = attachmentTree(step);
    assert.equal(attachments.filter(a => a.type === 'image/png').length, 1, `${step.name}: una imagen por validación`);
    const record = attachments.find(a => a.name === 'Resultado esperado y observado');
    assert.ok(record, `${step.name}: falta resultado`);
    const data = JSON.parse(await readFile(join(resultDir, record.source), 'utf8'));
    assert.ok(data.expected && data.observed);
    assert.notEqual(data.expected, data.observed);
    if (step.status === 'failed') assert.ok(data.assertion, 'Falta error original');
  }
}

// Solo copiar el HTML: ninguna imagen, resultado o JS externo está disponible.
const copyDir = await mkdtemp(join(tmpdir(), 'gestion-sqa-report-'));
const copyHTML = join(copyDir, 'index.html');
await copyFile(join(runDir, 'allure-report/index.html'), copyHTML);
const browser = await chromium.launch();
const uiChecks = [];
let server;
try {
  const context = await browser.newContext({ offline: true, viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();
  for (const result of results) {
    await page.goto(pathToFileURL(copyHTML).href);
    const suite = page.getByText('OrangeHRM | Autenticación', { exact: true });
    await expect(suite).toBeVisible();
    const caseRow = page.getByText(result.name, { exact: true });
    // Awesome expande automáticamente suites que contienen fallos.
    if (!await caseRow.isVisible()) await suite.click();
    await caseRow.click();
    const step = result.steps.find(s => s.uuid);
    await expect(page.getByText(step.name, { exact: true })).toBeVisible();
    await page.getByText('Evidencia funcional', { exact: true }).first().click();
    await expect(page.locator('img').first()).toBeVisible();
    await expect.poll(() => page.locator('img').first().evaluate(img => img.naturalWidth)).toBeGreaterThan(0);
    if (result.status === 'failed') {
      await expect(page.locator('body')).toContainText('Expected: 3');
      await expect(page.locator('body')).toContainText('Received: 2');
    }
    const id = result.name.split(' | ')[0];
    await page.screenshot({ path: join(runDir, `allure-${id}-verified.png`), fullPage: true });
    await page.getByText('Resultado esperado y observado', { exact: true }).first().click();
    await expect(page.locator('body')).toContainText('"expected"');
    await expect(page.locator('body')).toContainText('"observed"');
    uiChecks.push({ case: id, status: result.status, standaloneImageLoadedOffline: true });
  }
  await context.close();

  // Servir el HTML nativo mediante la misma CLI usada por report:local.
  server = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'show-report', join(runDir, 'playwright-report'), '--host', '127.0.0.1', '--port', '0'], {
    env: { ...process.env, CI: '1' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  const url = await new Promise((accept, reject) => {
    const timer = setTimeout(() => reject(new Error('El servidor HTML no arrancó')), 15_000);
    server.on('error', error => { clearTimeout(timer); reject(error); });
    server.on('exit', code => { clearTimeout(timer); reject(new Error(`Servidor terminó: ${code}`)); });
    server.stdout.on('data', chunk => {
      const match = chunk.toString().match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) { clearTimeout(timer); accept(match[0]); }
    });
  });
  const native = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  for (const result of results) {
    await native.goto(url);
    await native.getByRole('link', { name: result.name }).click();
    const step = native.getByRole('treeitem').filter({ hasText: result.steps.find(s => s.uuid).name }).first();
    await step.click();
    await expect(step).toContainText('Attach "Evidencia funcional"');
    await expect(step).toContainText('Attach "Resultado esperado y observado"');
    const screenshotLink = native.getByRole('link', { name: 'Evidencia funcional', exact: true }).first();
    await expect(screenshotLink).toBeVisible();
    const imageURL = await screenshotLink.getAttribute('href');
    assert.ok(imageURL);
    const response = await native.request.get(new URL(imageURL, url).href);
    assert.equal(response.status(), 200);
    assert.ok(response.headers()['content-type'].includes('image/png'));
    if (result.status === 'failed') await expect(native.locator('body')).toContainText('Expected: 3');
    await native.screenshot({ path: join(runDir, `playwright-${result.name.split(' | ')[0]}-verified.png`), fullPage: true });
  }
  const verification = { runDir, copyDir, verifiedAt: new Date().toISOString(), uiChecks, nativeStepsAndImages: true };
  await writeFile(join(runDir, 'report-verification.json'), JSON.stringify(verification, null, 2));
  console.log(JSON.stringify(verification, null, 2));
} finally {
  server?.kill();
  await browser.close();
}
