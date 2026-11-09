import type { RunTask } from "#vite/models/RunTask";

import { PNPM_STATE_PATTERNS } from "#vite/constants";

// Each task keeps the files its command rewrites out of its inputs, without which `vp` refuses to cache it.
// Those files stay outputs, so a hit restores them.
export const createTask = (
  command: string,
  rewrittenPatterns: string[],
  output: (string | { auto: true })[] = [{ auto: true }, ...PNPM_STATE_PATTERNS],
): RunTask => ({
  cache: {
    input: [{ auto: true }, ...PNPM_STATE_PATTERNS, ...rewrittenPatterns.map((pattern) => `!${pattern}`)],
    output,
  },
  command,
});
