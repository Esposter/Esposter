import type { ArgsDef, CommandDef } from "citty";

import { registerQuietExit } from "#src/services/registerQuietExit";
import { runCommand, showUsage } from "citty";

// A hook's command runs through `runCommand` rather than `runMain`, since `runMain` turns a throw into exit 1, and a
// Rejection that reaches the process boundary is what the quiet exit catches
// It answers `--help` here, as `runMain` would, since `runCommand` does not
export const runHookCommand = async <T extends ArgsDef>(command: CommandDef<T>): Promise<void> => {
  registerQuietExit();
  // oxlint-disable-next-line no-restricted-properties -- runCommand takes the hook's arguments from here, since runMain, which reads them itself, exits 1 on a throw
  const rawArgs = process.argv.slice(2);
  if (rawArgs.includes("--help") || rawArgs.includes("-h")) {
    await showUsage(command);
    return;
  }

  await runCommand(command, { rawArgs });
};
