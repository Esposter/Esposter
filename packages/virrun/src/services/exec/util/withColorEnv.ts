import type { ExecOptions } from "@/models/exec/ExecOptions";

import { getForceColorLevel } from "@/services/exec/util/getForceColorLevel";
// Forwards the host terminal's color support into the child as FORCE_COLOR so commands run inside virrun keep emitting
// Color. Under the os backend the wsl/bwrap bridge hides the real TTY from the Linux child (and the bwrap status fd is
// Piped), so pnpm/vitest/eslint auto-disable color and their output reaches the host as plain text. Gated to a live
// "inherit" passthrough to a real terminal: a capture/differential run (stdio "pipe") stays byte-clean so correctness
// Diffs are never polluted with escape codes, and a redirected/CI stdout (not a TTY) is left plain. FORCE_COLOR is
// Merged first so an explicit caller override in options.env still wins.
export const withColorEnv = (options: ExecOptions): ExecOptions => {
  if (options.stdio !== "inherit" || !process.stdout.isTTY) return options;
  return {
    ...options,
    env: { FORCE_COLOR: getForceColorLevel(process.stdout.getColorDepth()), ...options.env },
  };
};
