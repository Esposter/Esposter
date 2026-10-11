import type { ChildProcess, SpawnOptions } from "node:child_process";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "node:child_process";
import { CMD_UNSAFE_ARGUMENT_REGEX } from "#src/services/exec/spawn/constants";
import { spawnResolved } from "#src/services/exec/spawn/spawnResolved";

// Spawn every virrun child through here so it never flashes a console window on win32. Windows gives a console child
// Its own terminal window whenever it can't inherit the parent's — always for a `detached` child (severed from the
// Parent console, e.g. the wsl.exe reapers), and for any child when virrun runs from a windowless parent (a GUI task
// Runner, a nested detached node). windowsHide is forced last so no caller can accidentally re-show the window.
//
// An argv goes through spawnResolved, because on win32 a `.cmd` shim — pnpm, npx, every `node_modules/.bin` entry — is
// Otherwise unreachable without a shell: a direct spawn resolves only an `.exe` on PATH, and node refuses a batch file
// Outright. An argv that reaches cmd.exe stays data only without a line break or a percent sign, which cmd.exe reads as
// The end of the command or as an environment variable, so an argv carrying either is refused on win32 rather than
// Escaped. Off win32 it is node's spawn unchanged. A shell command string skips spawnResolved: there is nothing to
// Resolve, and a shell's exit code 1 on win32 would read as the command missing, turning an ordinary failure into a
// Spawn error.
export const spawnHidden = (file: string, args: readonly string[], options: SpawnOptions): ChildProcess => {
  if (process.platform === "win32" && !options.shell && args.some((arg) => CMD_UNSAFE_ARGUMENT_REGEX.test(arg)))
    throw new InvalidOperationError(Operation.Create, file, "a win32 argv cannot carry a line break or a percent sign");
  return (options.shell ? spawn : spawnResolved)(file, args, { ...options, windowsHide: true });
};
