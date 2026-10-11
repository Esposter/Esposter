import type { ChildProcess } from "node:child_process";

import { CommandNotFoundError } from "#src/models/exec/spawn/CommandNotFoundError";

// A cmd.exe child exits 1 for a command it cannot find. When nothing on the search path resolved the command, that exit
// Is reported as the ENOENT node gives a missing executable, so a caller sees the same failure whichever way the command
// Was missing.
export const hookCmdNotFound = (child: ChildProcess, command: string, args: readonly string[]): ChildProcess => {
  const { emit } = child;
  child.emit = (event: string | symbol, ...eventArguments: unknown[]): boolean => {
    if (event === "exit" && eventArguments[0] === 1)
      return emit.call(child, "error", new CommandNotFoundError("spawn", command, args));
    return emit.call(child, event, ...eventArguments);
  };
  return child;
};
