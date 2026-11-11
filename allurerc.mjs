import { defineConfig } from 'allure';
export default defineConfig({
  name: 'Gestión SQA · Automation Testing',
  output: process.env.SQA_RUN_DIR ? `${process.env.SQA_RUN_DIR}/allure-report` : './artifacts/allure-report',
  plugins: {
    awesome: { options: { singleFile: true, reportName: 'Gestión SQA · Automation Testing', reportLanguage: 'es', groupBy: ['suite'], stepTreeExpansion: 'expanded' } },
  },
});
