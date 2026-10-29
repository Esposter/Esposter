import type { SetupRunResult } from "#src/models/setup/SetupRunResult";

// What the steps read and change on this machine. It is handed to each step, so a test answers for the machine rather
// than touching it
export interface SetupEnvironment {
  // How many files a folder holds, undefined when there is no folder
  countFiles: (path: string) => number | undefined;
  exists: (path: string) => boolean;
  makeDirectory: (path: string) => void;
  // The root of the main checkout, which every linked worktree shares with it
  mainCheckoutRoot: string;
  readText: (path: string) => string | undefined;
  run: (file: string, args: readonly string[]) => SetupRunResult;
  runVisibly: (file: string, args: readonly string[]) => SetupRunResult;
}
