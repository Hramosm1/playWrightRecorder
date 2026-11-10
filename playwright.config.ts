import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';
import { environment } from './support/environment.js';

// Se hereda a workers y también permite corridas aisladas desde la extensión.
process.env.SQA_RUN_DIR ||= resolve('artifacts', new Date().toISOString().replace(/[:.]/g, '-') + '-' + process.pid);
const runDir = process.env.SQA_RUN_DIR;

export default defineConfig({
  globalSetup: './support/prepare-run.ts',
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  outputDir: resolve(runDir, 'test-results'),
  reporter: [
    ['list'],
    ['html', { outputFolder: resolve(runDir, 'playwright-report'), open: 'never' }],
    ['json', { outputFile: resolve(runDir, 'results.json') }],
    ['allure-playwright', {
      resultsDir: resolve(runDir, 'allure-results'), detail: false,
      environmentInfo: { Ambiente: environment.name, URL: environment.baseURL, Node: process.version, Navegador: 'Chromium' },
    }],
  ],
  use: {
    baseURL: environment.baseURL,
    ...devices['Desktop Chrome'],
    screenshot: 'off', // Una sola captura por validación, en functionalStep.
    trace: { mode: 'retain-on-failure', screenshots: false, snapshots: true, sources: true },
    video: 'off',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
