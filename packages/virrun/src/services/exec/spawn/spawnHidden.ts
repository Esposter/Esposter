import type { ChildProcess, SpawnOptions } from "node:child_process";

import { spawnResolved } from "#src/services/exec/spawn/spawnResolved";
import { spawn } from "@esposter/shared-node/child-process";

// Spawn every virrun child through here: the `.cmd` resolution below is virrun's own, and the window hiding is the shared
// `@esposter/shared-node/child-process` wrapper's, which every virrun spawn goes through.
//
// An argv goes through spawnResolved, because on win32 a `.cmd` shim — pnpm, npx, every `node_modules/.bin` entry — is
// Otherwise unreachable without a shell: a direct spawn resolves only an `.exe` on PATH, and node refuses a batch file
// Outright. Off win32 it is node's spawn unchanged. A shell command string skips spawnResolved: there is nothing to
// Resolve, and a shell's exit code 1 on win32 would read as the command missing, turning an ordinary failure into a
// Spawn error.
export const spawnHidden = (file: string, args: readonly string[], options: SpawnOptions): ChildProcess =>
  (options.shell ? spawn : spawnResolved)(file, args, options);
