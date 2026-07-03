import type { ChildProcess, SpawnOptions } from "node:child_process";

import { spawn } from "node:child_process";
// Spawn every virrun child through here so it never flashes a console window on win32. Windows gives a console child
// Its own terminal window whenever it can't inherit the parent's — always for a `detached` child (severed from the
// Parent console, e.g. the wsl.exe reapers), and for any child when virrun runs from a windowless parent (a GUI task
// Runner, a nested detached node). windowsHide is forced last so no caller can accidentally re-show the window.
export const spawnHidden = (file: string, args: readonly string[], options: SpawnOptions): ChildProcess =>
  spawn(file, args, { ...options, windowsHide: true });
