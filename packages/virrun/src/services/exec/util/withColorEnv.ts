import type { ExecOptions } from "@/models/exec/ExecOptions";

import { getForceColorLevel } from "@/services/exec/util/getForceColorLevel";
// Sets the child's FORCE_COLOR so its color output is a deterministic function of the run's shape, never of the
// Parent's ambient env. A live "inherit" run to a real terminal forwards the host's color fidelity so pnpm/vitest/
// Eslint keep emitting color (under the os backend the wsl/bwrap bridge hides the real TTY, so they'd otherwise
// Auto-disable it). Every other run — a capture/differential (stdio "pipe") or a redirected/CI inherit — pins
// FORCE_COLOR="0": a dev's inherited FORCE_COLOR would otherwise bleed escape codes into captured stdout and break
// The byte-exact correctness diffs and the task cache. Without this pin the capture is only clean when the parent
// Happens to have no FORCE_COLOR set. FORCE_COLOR is merged first either way, so an explicit caller override still wins.
export const withColorEnv = (options: ExecOptions): ExecOptions => {
  const forceColor =
    options.stdio === "inherit" && process.stdout.isTTY ? getForceColorLevel(process.stdout.getColorDepth()) : "0";
  return { ...options, env: { FORCE_COLOR: forceColor, ...options.env } };
};
