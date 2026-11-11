import type { CachePattern } from "#vite/models/CachePattern";
import type { RunTask } from "#vite/models/RunTask";

import { PNPM_STATE_PATTERNS } from "#vite/constants";

// A file a task reads and also rewrites is traced like any other input and restored from the outputs on a hit
export const createTask = (
  command: string,
  output: CachePattern[] = [{ auto: true }, ...PNPM_STATE_PATTERNS],
): RunTask => ({ cache: { input: [{ auto: true }, ...PNPM_STATE_PATTERNS], output }, command });
