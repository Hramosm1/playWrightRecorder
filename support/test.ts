import { test as base, expect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { LoginPage } from '../pages/login.page.js';
import { environment } from './environment.js';

export const test = base.extend<{ login: LoginPage }>({
  login: async ({ page }, use) => { await use(new LoginPage(page)); },
});
test.beforeEach(async ({ browserName }, testInfo) => {
  const id = testInfo.title.match(/^[A-Z]+-\d+/)?.[0] || 'SIN-ID';
  await allure.suite(testInfo.titlePath.at(-2) || 'Sin suite');
  await allure.label('caseId', id);
  await allure.parameter('ID', id);
  await allure.parameter('Navegador', browserName);
  await allure.parameter('Ambiente', environment.name);
});
export { expect };
