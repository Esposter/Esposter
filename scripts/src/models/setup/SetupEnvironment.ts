import type { SetupRunResult } from "#src/models/setup/SetupRunResult";

// What the steps read and change on this machine. It is handed to each step, so a test answers for the machine rather
// than touching it
export interface SetupEnvironment {
  exists: (path: string) => boolean;
  makeDirectory: (path: string) => void;
  readText: (path: string) => string | undefined;
  run: (file: string, args: readonly string[]) => SetupRunResult;
  runVisibly: (file: string, args: readonly string[]) => SetupRunResult;
}
