import { cancel, confirm, isCancel, multiselect, select } from '@clack/prompts';
import {
  DEFAULT_INIT_SELECTIONS,
  type FormLibrary,
  type InitSelections,
  type OptionalPackage,
  type ProjectType,
  type StateManager,
  formatSelectionsSummary,
} from './packages.js';

export interface InitPromptOptions {
  yes?: boolean;
  noExamples?: boolean;
  projectType?: ProjectType;
}

function exitOnCancel<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel('Cancelled');
    process.exit(0);
  }
  return value;
}

export async function promptInitSelections(options: InitPromptOptions = {}): Promise<InitSelections> {
  if (options.yes) {
    return {
      ...DEFAULT_INIT_SELECTIONS,
      projectType: options.projectType ?? DEFAULT_INIT_SELECTIONS.projectType,
      withExamples: options.noExamples ? false : DEFAULT_INIT_SELECTIONS.withExamples,
    };
  }

  const projectType = exitOnCancel(
    await select<ProjectType>({
      message: 'Project type?',
      options: [
        { value: 'full', label: 'Full app — all FSD layers (app/views/widgets/features/entities/shared)' },
        { value: 'standard', label: 'Standard — without widgets/views (features + entities + shared)' },
        { value: 'simple', label: 'Simple — only shared + features (landings, small sites)' },
      ],
      initialValue: options.projectType ?? 'full',
    }),
  );

  const stateManager = exitOnCancel(
    await select<StateManager>({
      message: 'Which state manager do you want?',
      options: [
        { value: 'zustand', label: 'Zustand (recommended)' },
        { value: 'redux', label: 'Redux Toolkit' },
        { value: 'jotai', label: 'Jotai' },
        { value: 'none', label: 'None' },
      ],
      initialValue: 'zustand',
    }),
  );

  const formLibrary = exitOnCancel(
    await select<FormLibrary>({
      message: 'Which form library do you want?',
      options: [
        { value: 'tanstack-form', label: 'TanStack Form (recommended)' },
        { value: 'react-hook-form', label: 'React Hook Form' },
        { value: 'none', label: 'None' },
      ],
      initialValue: 'tanstack-form',
    }),
  );

  const optionalPackages = exitOnCancel(
    await multiselect<OptionalPackage>({
      message: 'Select additional packages (multi-select)',
      options: [
        { value: 'tanstack-table', label: 'TanStack Table (headless tables)' },
        { value: 'motion', label: 'Motion / Framer Motion (animations)' },
        { value: 'nuqs', label: 'nuqs (URL state management)' },
        { value: 'trpc', label: 'tRPC (end-to-end type safety, if using separate backend)' },
        { value: 'better-auth', label: 'Better Auth (alternative to NextAuth)' },
        { value: 'uploadthing', label: 'Uploadthing (file uploads)' },
        { value: 'sonner', label: 'Sonner (toast notifications)' },
        { value: 'next-intl', label: 'next-intl (i18n)' },
        { value: 'sentry', label: 'Sentry (error tracking)' },
      ],
      initialValues: ['tanstack-table'],
      required: false,
    }),
  );

  let withExamples = true;
  if (!options.noExamples) {
    withExamples = exitOnCancel(
      await confirm({
        message: 'Generate example files with comments (Russian)?',
        initialValue: true,
      }),
    );
  } else {
    withExamples = false;
  }

  const selections: InitSelections = {
    projectType,
    stateManager,
    formLibrary,
    optionalPackages,
    withExamples,
  };

  const proceed = exitOnCancel(
    await confirm({
      message: `Proceed with this setup?\n${formatSelectionsSummary(selections).map((l) => `  • ${l}`).join('\n')}`,
      initialValue: true,
    }),
  );

  if (!proceed) {
    cancel('Cancelled');
    process.exit(0);
  }

  return selections;
}
