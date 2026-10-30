import type { SetupProcessOptions } from "#src/models/setup/SetupProcessOptions";
import type { SetupRunResult } from "#src/models/setup/SetupRunResult";

import { MAX_BUFFER_BYTES, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { spawnSync } from "@esposter/shared-node/child-process";

// A process runs from the repository root, its output read, or shown on this terminal when a person is to watch it.
// That is how an install's progress is shown.
// A process that cannot start has no status, which every step reads as not in place.
// It runs through a shell where the platform needs one.
// `az` and `claude` are `.cmd` shims on Windows that a spawn without one cannot find.
// The shell receives only the file and arguments, each quoted, which are constants and the pnpm path from `npm_execpath`
export const runSetupProcess = (
  file: string,
  args: readonly string[],
  { isThroughShell, stdio }: SetupProcessOptions,
): SetupRunResult => {
  const options = { cwd: REPOSITORY_ROOT, encoding: "utf8", maxBuffer: MAX_BUFFER_BYTES, stdio } as const;
  const result = isThroughShell
    ? spawnSync([file, ...args].map((part) => `"${part}"`).join(" "), { ...options, shell: true })
    : spawnSync(file, args, options);
  return { status: result.status, stdout: result.stdout };
};
