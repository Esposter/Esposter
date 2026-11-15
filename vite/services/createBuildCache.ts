import type { RunTask } from "#vite/models/RunTask";

import { CacheBase } from "#vite/models/CacheBase";
import { PACKAGES_DIRECTORY, PNPM_STATE_PATTERNS } from "#vite/services/constants";

// A build's cache: the files it reads tracked automatically, less the files it rewrites in its own package, which are
// Resolved from the workspace root as the task belongs to it rather than to the package its `cwd` names
export const createBuildCache = (directory: string, rewrittenPatterns: readonly string[]): RunTask["cache"] => ({
  input: [
    { auto: true },
    ...PNPM_STATE_PATTERNS,
    ...rewrittenPatterns.map((pattern) => ({
      base: CacheBase.Workspace,
      pattern: `!${PACKAGES_DIRECTORY}/${directory}/${pattern}`,
    })),
  ],
  output: [{ auto: true }, ...PNPM_STATE_PATTERNS],
});
