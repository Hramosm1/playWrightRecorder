import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

export async function latestRun() {
  return JSON.parse(await readFile('artifacts/latest.json', 'utf8')).runDir;
}
export function generateReport(runDir) {
  const result = spawnSync(process.execPath, ['node_modules/allure/cli.js', 'generate', resolve(runDir, 'allure-results'), '--config', 'allurerc.mjs', '--clean'], {
    env: { ...process.env, SQA_RUN_DIR: resolve(runDir) }, stdio: 'inherit',
  });
  if (result.error) console.error(result.error);
  return result.status ?? 1;
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = generateReport(process.argv[2] || await latestRun());
}
