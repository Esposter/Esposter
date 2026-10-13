import type { ChildProcess, SpawnOptions } from "node:child_process";

import { CMD_UNSAFE_ARGUMENT_REGEX, WIN32_EXECUTABLE_REGEX } from "#src/services/exec/spawn/constants";
import { escapeCmdArgument } from "#src/services/exec/spawn/escapeCmdArgument";
import { escapeCmdCommand } from "#src/services/exec/spawn/escapeCmdCommand";
import { hookCmdNotFound } from "#src/services/exec/spawn/hookCmdNotFound";
import { resolveCmdCommand } from "#src/services/exec/spawn/resolveCmdCommand";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawn } from "@esposter/shared-node/child-process";
import { normalize } from "node:path";

// Spawns a command the way node does off win32. On win32 the command is found through PATH and PATHEXT first, so a
// `.cmd` or `.bat` shim, which node refuses to run directly, is run by cmd.exe with every argument escaped for it. A
// `.com` or `.exe` runs directly, and a command found nowhere goes to cmd.exe too, which then reports it not found.
//
// An argument reaching cmd.exe stays data only without a line break or a percent sign, which cmd.exe reads as the end
// Of the command or as an environment variable, so one carrying either is refused rather than escaped. Only there: an
// `.exe` receives its argv as data, which is how `wsl.exe --exec sh -c` carries a multi-line script.
export const spawnResolved = (file: string, args: readonly string[], options: SpawnOptions): ChildProcess => {
  if (process.platform !== "win32") return spawn(file, args, options);
  const resolved = resolveCmdCommand(file, {
    cwd: typeof options.cwd === "string" ? options.cwd : undefined,
    env: options.env,
  });
  if (resolved !== undefined && WIN32_EXECUTABLE_REGEX.test(resolved)) return spawn(resolved, args, options);
  if (args.some((argument) => CMD_UNSAFE_ARGUMENT_REGEX.test(argument)))
    throw new InvalidOperationError(
      Operation.Create,
      file,
      "a cmd.exe argv cannot carry a line break or a percent sign",
    );
  const command = escapeCmdCommand(normalize(resolved ?? file));
  const escapedArguments = args.map((argument) => escapeCmdArgument(argument));
  const child = spawn(
    process.env.comspec || "cmd.exe",
    ["/d", "/s", "/c", `"${[command, ...escapedArguments].join(" ")}"`],
    { ...options, windowsVerbatimArguments: true },
  );
  return resolved === undefined ? hookCmdNotFound(child, file, args) : child;
};
