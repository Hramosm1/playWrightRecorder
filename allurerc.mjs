import { defineConfig } from 'allure';
export default defineConfig({
  name: 'Gestión SQA · OrangeHRM',
  output: process.env.SQA_RUN_DIR ? `${process.env.SQA_RUN_DIR}/allure-report` : './artifacts/allure-report',
  plugins: {
    awesome: { options: { singleFile: true, reportName: 'Gestión SQA · OrangeHRM', reportLanguage: 'es', groupBy: ['suite'], stepTreeExpansion: 'expanded' } },
  },
});
