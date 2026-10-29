import type { SetupRunResult } from "#src/models/setup/SetupRunResult";

import { MAX_BUFFER_BYTES, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { spawnSync } from "@esposter/shared-node/child-process";

// A process run from the repository root, its output read, or shown on this terminal when a person is to watch it, as an
// install's progress is. A process that cannot start has no status, which every step reads as not in place. On Windows the
// line goes through a shell, since `az` and `claude` are `.cmd` shims that a spawn without one cannot find; every file and
// argument here is a constant, quoted, so no input reaches the shell
export const runSetupProcess = (file: string, args: readonly string[], stdio: "inherit" | "pipe"): SetupRunResult => {
  const options = { cwd: REPOSITORY_ROOT, encoding: "utf8", maxBuffer: MAX_BUFFER_BYTES, stdio } as const;
  const result =
    process.platform === "win32"
      ? spawnSync([file, ...args].map((part) => `"${part}"`).join(" "), { ...options, shell: true })
      : spawnSync(file, args, options);
  return { status: result.status, stdout: result.stdout };
};
