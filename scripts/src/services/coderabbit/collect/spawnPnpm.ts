import type { SpawnSyncOptions, SpawnSyncReturns } from "node:child_process";

import { IS_PNPM_SHELL } from "#src/services/coderabbit/collect/constants";
import { spawnSync } from "node:child_process";

// Every `pnpm` the collector waits on — the checks, the install behind a lockfile rebuild and the feedback read —
// Is spawned the same way. The exit status is the caller's to read, because what a non-zero one means differs
// Per call — a red check, a failed install. The drain is the one `pnpm` spawned asynchronously (`runDrain`),
// Because its output is read as it happens.
export const spawnPnpm = (
  args: string[],
  options: Pick<SpawnSyncOptions, "cwd" | "env" | "input" | "stdio">,
): SpawnSyncReturns<string> => spawnSync("pnpm", args, { ...options, encoding: "utf8", shell: IS_PNPM_SHELL });
