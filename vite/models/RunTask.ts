import type { RunTasks } from "#vite/models/RunTasks";

// A task written out in full, as against the command-string and command-list shorthands the map also takes
export type RunTask = Exclude<RunTasks[string], string | string[]>;
