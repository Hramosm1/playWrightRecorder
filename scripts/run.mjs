import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { generateReport } from './report.mjs';

const runDir = resolve('artifacts', new Date().toISOString().replace(/[:.]/g, '-') + '-' + process.pid);
await mkdir(runDir, { recursive: true });
const env = { ...process.env, SQA_RUN_DIR: runDir };
const test = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)], { env, stdio: 'inherit' });
const testCode = test.status ?? 1;
// Siempre intentar el reporte; nunca convertir un test fallido en salida exitosa.
const reportCode = generateReport(runDir);
await writeFile(resolve(runDir, 'run.json'), JSON.stringify({ runDir, testCode, reportCode, node: process.version }, null, 2));
await writeFile('artifacts/latest.json', JSON.stringify({ runDir }, null, 2));
console.log(`\nCorrida: ${runDir}\nPruebas: ${testCode}; reporte: ${reportCode}`);
process.exitCode = testCode || reportCode;
