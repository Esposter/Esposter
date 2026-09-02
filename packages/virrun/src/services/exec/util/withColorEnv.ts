import type { ExecOptions } from "#src/models/exec/ExecOptions";

import { getForceColorLevel } from "#src/services/exec/util/getForceColorLevel";
// Sets the child's FORCE_COLOR so its color output is a deterministic function of the run's shape, never of the
// Parent's ambient env. A live "inherit" run to a real terminal forwards the host's color fidelity so the
// Toolchain (pnpm, vitest, eslint) keeps emitting color — under the os backend the wsl/bwrap bridge hides the
// Real TTY, so they'd otherwise auto-disable it. Every other run — a capture/differential (stdio "pipe") or a
// Redirected/CI inherit — pins FORCE_COLOR="0": a dev's inherited FORCE_COLOR would otherwise bleed escape
// Codes into captured stdout and break the byte-exact correctness diffs and the task cache. Without this pin
// The capture is only clean when the parent happens to have no FORCE_COLOR set. FORCE_COLOR is merged first
// Either way, so an explicit caller override still wins.
export const withColorEnv = (options: ExecOptions): ExecOptions => {
  const forceColor =
    options.stdio === "inherit" && process.stdout.isTTY ? getForceColorLevel(process.stdout.getColorDepth()) : "0";
  return { ...options, env: { FORCE_COLOR: forceColor, ...options.env } };
};
