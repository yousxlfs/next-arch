import { program } from 'commander';
import { cancel, log, outro } from '@clack/prompts';
import chalk from 'chalk';
import path from 'path';
import { doctorCommand } from './commands/doctor.js';
import { generateCommand } from './commands/generate.js';
import { initCommand } from './commands/init.js';
import { pageCommand } from './commands/page.js';
import { isProjectType, type ProjectType } from './lib/packages.js';
import type { PagePreset } from './lib/page-presets.js';

console.log(chalk.blue('Next Architecture CLI'));

program
  .name('next-arch')
  .description('CLI for Next.js Feature-Sliced Architecture')
  .version('0.2.1');

program
  .command('init <projectName>')
  .description('Create a new project with Next Architecture')
  .option('-C, --cwd <path>', 'directory where the project folder will be created')
  .option('-y, --yes', 'use default package selections without prompts')
  .option('--no-examples', 'skip generating example files')
  .option('--project-type <type>', 'project type: full, standard, simple')
  .action(
    async (
      projectName: string,
      options: {
        cwd?: string;
        yes?: boolean;
        noExamples?: boolean;
        examples?: boolean;
        projectType?: string;
      },
    ) => {
    try {
      if (options.projectType && !isProjectType(options.projectType)) {
        throw new Error('Invalid --project-type. Use: full, standard, simple');
      }

      await initCommand(projectName, {
        cwd: options.cwd,
        yes: options.yes,
        noExamples: options.examples === false,
        projectType: options.projectType as ProjectType | undefined,
      });
    } catch (error) {
      cancel(error instanceof Error ? error.message : 'Init failed');
      process.exit(1);
    }
  });

program
  .command('doctor')
  .description('Check FSD structure and common architecture violations')
  .option('-C, --cwd <path>', 'path to Next.js project root (default: current directory)')
  .action(async (options: { cwd?: string }) => {
    try {
      const projectRoot = options.cwd ? path.resolve(options.cwd) : process.cwd();
      await doctorCommand(projectRoot);
    } catch (error) {
      cancel(error instanceof Error ? error.message : 'Doctor failed');
      process.exit(1);
    }
  });

program
  .command('page <name>')
  .description('Generate a full FSD page (view + feature + routes)')
  .option('-C, --cwd <path>', 'path to Next.js project root (default: current directory)')
  .option('-f, --force', 'overwrite existing page paths')
  .option('-y, --yes', 'use blank preset without prompts')
  .option('--preset <preset>', 'page preset: auth, dashboard, crud, profile, settings, blank')
  .action(
    async (
      name: string,
      options: { cwd?: string; force?: boolean; yes?: boolean; preset?: PagePreset },
    ) => {
      try {
        const projectRoot = options.cwd ? path.resolve(options.cwd) : process.cwd();
        await pageCommand(name, projectRoot, {
          force: options.force,
          yes: options.yes,
          preset: options.preset,
        });
        outro('Done!');
      } catch (error) {
        cancel(error instanceof Error ? error.message : 'Page generation failed');
        process.exit(1);
      }
    },
  );

program
  .command('generate <type> <name>')
  .alias('g')
  .description('Generate page, feature, widget, entity, or view')
  .option('-C, --cwd <path>', 'path to Next.js project root (default: current directory)')
  .option('-f, --force', 'overwrite existing slice')
  .option('-y, --yes', 'skip interactive page preset selection')
  .option('--preset <preset>', 'page preset when type is page')
  .action(
    async (
      type: string,
      name: string,
      options: { cwd?: string; force?: boolean; yes?: boolean; preset?: string },
    ) => {
      try {
        const projectRoot = options.cwd ? path.resolve(options.cwd) : process.cwd();
        await generateCommand(type, name, projectRoot, {
          force: options.force,
          yes: options.yes,
          preset: options.preset,
        });
        outro('Done!');
      } catch (error) {
        cancel(error instanceof Error ? error.message : 'Generate failed');
        process.exit(1);
      }
    },
  );

program.parseAsync(process.argv).catch((error: unknown) => {
  log.error(error instanceof Error ? error.message : 'Unexpected error');
  process.exit(1);
});
