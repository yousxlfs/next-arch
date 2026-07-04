import { program } from 'commander';
import { cancel, log, outro } from '@clack/prompts';
import chalk from 'chalk';
import { doctorCommand } from './commands/doctor.js';
import { generateCommand } from './commands/generate.js';
import { initCommand } from './commands/init.js';
import { pageCommand } from './commands/page.js';
import { isProjectType, type ProjectType } from './lib/packages.js';
import type { PagePreset } from './lib/page-presets.js';
import { resolveProjectRoot } from './lib/project-paths.js';

if (process.stdout.isTTY) {
  console.log(chalk.blue('Next Architecture CLI'));
}

program
  .name('next-arch')
  .description('CLI for Next.js Feature-Sliced Architecture')
  .version('0.3.2');

program
  .command('init <projectName>')
  .description('Create a new project with Next Architecture')
  .option('-C, --output-dir <path>', 'parent directory where <projectName>/ will be created')
  .option('--cwd <path>', 'deprecated alias for --output-dir')
  .option('-y, --yes', 'use default package selections without prompts')
  .option('--no-examples', 'skip generating example files')
  .option('--project-type <type>', 'project type: full, standard, simple')
  .action(
    async (
      projectName: string,
      options: {
        outputDir?: string;
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
        outputDir: options.outputDir ?? options.cwd,
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
      await doctorCommand(resolveProjectRoot(options.cwd));
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
        await pageCommand(name, resolveProjectRoot(options.cwd), {
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
        await generateCommand(type, name, resolveProjectRoot(options.cwd), {
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
