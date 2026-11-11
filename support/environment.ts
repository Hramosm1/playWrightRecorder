import 'dotenv/config';

export const environment = {
  baseURL: process.env.REGISTRATION_BASE_URL || 'https://demo.automationtesting.in',
  name: process.env.REGISTRATION_TEST_ENV || 'Automation Testing demo público',
};
