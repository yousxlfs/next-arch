import { intro, log, outro } from '@clack/prompts';
import fs from 'fs-extra';
import path from 'path';
import { runDoctorChecks, type DoctorIssue } from '../lib/doctor-checks.js';

function assertNextProject(cwd: string): void {
  const packageJson = path.join(cwd, 'package.json');
  const srcDir = path.join(cwd, 'src');

  if (!fs.existsSync(packageJson) || !fs.existsSync(srcDir)) {
    throw new Error('Run this command from the root of a Next Architecture project.');
  }
}

function printIssue(issue: DoctorIssue): void {
  const prefix = issue.file ? `${issue.file}: ` : '';

  switch (issue.level) {
    case 'error':
      log.error(`${prefix}${issue.message}`);
      break;
    case 'warning':
      log.warn(`${prefix}${issue.message}`);
      break;
    case 'info':
      log.info(`${prefix}${issue.message}`);
      break;
  }
}

export async function doctorCommand(projectRoot = process.cwd()): Promise<void> {
  const root = path.resolve(projectRoot);
  assertNextProject(root);

  intro('next-arch doctor');

  const issues = await runDoctorChecks(root);
  const errors = issues.filter((i) => i.level === 'error');
  const warnings = issues.filter((i) => i.level === 'warning');
  const infos = issues.filter((i) => i.level === 'info');

  for (const issue of [...infos, ...warnings, ...errors]) {
    printIssue(issue);
  }

  if (errors.length === 0 && warnings.length === 0) {
    log.success('FSD structure valid — no errors or warnings');
    outro('All checks passed');
    return;
  }

  log.info('');
  log.info(`Found: ${errors.length} error${errors.length === 1 ? '' : 's'}, ${warnings.length} warning${warnings.length === 1 ? '' : 's'}`);

  if (errors.length > 0) {
    outro('Fix errors before shipping');
    process.exitCode = 1;
    return;
  }

  outro('No blocking errors');
}
