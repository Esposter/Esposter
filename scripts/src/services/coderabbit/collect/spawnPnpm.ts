import type { SpawnSyncOptions, SpawnSyncReturns } from "node:child_process";

import { spawnSync } from "node:child_process";

// Every `pnpm` the collector runs — the checks, the install behind a lockfile rebuild, the feedback read and the
// Drain — is spawned the same way: `pnpm` is a shim on Windows that only a shell resolves, and every other
// Platform runs the binary as it is. The exit status is the caller's to read, because what a non-zero one means
// Differs per call — a red check, a failed install, a drain that refused to start.
export const spawnPnpm = (
  args: string[],
  options: Pick<SpawnSyncOptions, "cwd" | "env" | "input" | "stdio">,
): SpawnSyncReturns<string> =>
  spawnSync("pnpm", args, { ...options, encoding: "utf8", shell: process.platform === "win32" });
