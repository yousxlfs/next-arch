import { program } from 'commander';
import { cancel, log, outro } from '@clack/prompts';
import chalk from 'chalk';
import path from 'path';
import { generateCommand } from './commands/generate.js';
import { initCommand } from './commands/init.js';

console.log(chalk.blue('Next Architecture CLI'));

program
  .name('next-arch')
  .description('CLI for Next.js Feature-Sliced Architecture')
  .version('0.1.0');

program
  .command('init <projectName>')
  .description('Create a new project with Next Architecture')
  .option('-C, --cwd <path>', 'directory where the project folder will be created')
  .action(async (projectName: string, options: { cwd?: string }) => {
    try {
      await initCommand(projectName, { cwd: options.cwd });
    } catch (error) {
      cancel(error instanceof Error ? error.message : 'Init failed');
      process.exit(1);
    }
  });

program
  .command('generate <type> <name>')
  .alias('g')
  .description('Generate feature, widget, entity, or view')
  .option('-C, --cwd <path>', 'path to Next.js project root (default: current directory)')
  .option('-f, --force', 'overwrite existing slice')
  .action(async (type: string, name: string, options: { cwd?: string; force?: boolean }) => {
    try {
      const projectRoot = options.cwd ? path.resolve(options.cwd) : process.cwd();
      await generateCommand(type, name, projectRoot, { force: options.force });
      outro('Done!');
    } catch (error) {
      cancel(error instanceof Error ? error.message : 'Generate failed');
      process.exit(1);
    }
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  log.error(error instanceof Error ? error.message : 'Unexpected error');
  process.exit(1);
});
