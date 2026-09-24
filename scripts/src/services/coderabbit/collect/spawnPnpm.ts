import type { SpawnSyncOptions, SpawnSyncReturns } from "node:child_process";

import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";
import { spawnSync } from "node:child_process";

// Every `pnpm` the collector waits on — the checks and the installs — is spawned the same way. The exit status is
// The caller's to read, because what a non-zero one means differs per call — a red check, a failed install. The
// Drain is the one `pnpm` spawned asynchronously (`runDrain`), because its output is read as it happens.
export const spawnPnpm = (
  args: string[],
  options: Pick<SpawnSyncOptions, "cwd" | "env" | "input" | "maxBuffer" | "stdio">,
): SpawnSyncReturns<string> => spawnSync(PNPM_FILE, [...PNPM_ARGS, ...args], { ...options, encoding: "utf8" });
