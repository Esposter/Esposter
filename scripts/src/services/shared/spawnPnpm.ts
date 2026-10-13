import type { SpawnSyncOptions, SpawnSyncReturns } from "node:child_process";

import { PNPM_ARGS, PNPM_FILE } from "#src/services/shared/constants";
import { spawnSync } from "@esposter/shared-node/child-process";

// Every `pnpm` a script waits on — the checks and the installs — is spawned the same way. The exit status is the
// Caller's to read, because what a non-zero one means differs per call — a red check, a failed install. A `timeout`
// Kills the child past it and leaves `status` null, which every caller already reads as a failure.
export const spawnPnpm = (
  args: string[],
  options: Pick<SpawnSyncOptions, "cwd" | "env" | "input" | "maxBuffer" | "stdio" | "timeout">,
): SpawnSyncReturns<string> => spawnSync(PNPM_FILE, [...PNPM_ARGS, ...args], { ...options, encoding: "utf8" });
