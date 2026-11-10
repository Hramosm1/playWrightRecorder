import 'dotenv/config';

export const environment = {
  baseURL: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
  name: process.env.TEST_ENV || 'OrangeHRM demo público',
};

export function demoCredentials() {
  const username = process.env.DEMO_USERNAME;
  const password = process.env.DEMO_PASSWORD;
  if (!username || !password) throw new Error('Completa DEMO_USERNAME y DEMO_PASSWORD en .env con los datos públicos de Login.');
  return { username, password };
}
