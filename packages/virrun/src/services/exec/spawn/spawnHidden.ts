import type { ChildProcess, SpawnOptions } from "node:child_process";

import { InvalidOperationError, Operation } from "@esposter/shared";
import crossSpawn from "cross-spawn";
import { spawn } from "node:child_process";

// Spawn every virrun child through here so it never flashes a console window on win32. Windows gives a console child
// Its own terminal window whenever it can't inherit the parent's — always for a `detached` child (severed from the
// Parent console, e.g. the wsl.exe reapers), and for any child when virrun runs from a windowless parent (a GUI task
// Runner, a nested detached node). windowsHide is forced last so no caller can accidentally re-show the window.
//
// An argv goes through cross-spawn, because on win32 a `.cmd` shim — pnpm, npx, every `node_modules/.bin` entry — is
// Otherwise unreachable without a shell: a direct spawn resolves only an `.exe` on PATH, and node refuses a batch file
// Outright. Cross-spawn resolves the file through PATHEXT and runs a shim under cmd.exe with every argument escaped,
// So an argv stays data there too — except a CR or LF, which that escaping leaves bare and cmd.exe reads as the end of
// The command even inside quotes, so the rest would run as a second one. An argv carrying either is refused on win32.
// Off win32 it is node's spawn unchanged. A shell command string skips it: there is nothing to resolve, and cross-spawn
// Reads a shell's exit code 1 on win32 as the command missing, turning an ordinary failure into a spawn error.
export const spawnHidden = (file: string, args: readonly string[], options: SpawnOptions): ChildProcess => {
  if (process.platform === "win32" && !options.shell && args.some((arg) => /[\n\r]/u.test(arg)))
    throw new InvalidOperationError(Operation.Create, file, "a win32 argv cannot carry a line break");
  return (options.shell ? spawn : crossSpawn)(file, args, { ...options, windowsHide: true });
};
