import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { latestRun } from './report.mjs';
const result = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'show-report', resolve(process.argv[2] || await latestRun(), 'playwright-report')], { stdio: 'inherit' });
process.exitCode = result.status ?? 1;
