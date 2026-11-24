import type { ArgsDef, CommandDef } from "citty";

import { registerQuietExit } from "#src/services/registerQuietExit";
import { runCommand, showUsage } from "citty";

// A hook's command runs through `runCommand` rather than `runMain`, since `runMain` turns a throw into exit 1.
// A rejection that reaches the process boundary is what the quiet exit catches.
// It answers `--help` here, as `runMain` would, since `runCommand` does not.
export const runHookCommand = async <T extends ArgsDef>(command: CommandDef<T>): Promise<void> => {
  registerQuietExit();
  // `runCommand` takes the hook's arguments from here, since `runMain` reads them itself and exits 1 on a throw.
  // oxlint-disable-next-line no-restricted-properties -- the arguments are read from the process here
  const rawArgs = process.argv.slice(2);
  if (rawArgs.includes("--help") || rawArgs.includes("-h")) {
    await showUsage(command);
    return;
  }

  await runCommand(command, { rawArgs });
};
