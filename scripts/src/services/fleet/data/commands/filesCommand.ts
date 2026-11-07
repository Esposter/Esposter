import type { SubCommandsDef } from "citty";

import { printDirectoryFiles } from "#src/services/fleet/data/commands/printDirectoryFiles";
import { readStdinLines } from "#src/services/fleet/data/commands/readStdinLines";
import { getParityDirectory } from "#src/services/fleet/data/getParityDirectory";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

// `pnpm ai:fleet:data files <dir>...` — one JSON line per directory with its direct files, the directories named as arguments
// Or, with --stdin, one per line on stdin, as a peer's copy sends them
export const filesCommand: SubCommandsDef[string] = defineCommand({
  args: {
    directory: { description: "The parity directory the named directories are under", type: "string" },
    stdin: { description: "Read the directories from stdin, one per line, instead of as arguments", type: "boolean" },
  },
  meta: { description: "Print the direct files of each named directory, one JSON line each", name: "files" },
  run: async ({ args }) => {
    // Stdin is read only when asked for, since a piped one that stays open would hang a command that never reads it
    const directories = args.stdin ? await readStdinLines() : args._;
    if (directories.length === 0) throw new InvalidOperationError(Operation.Read, "directories", "none was named");
    await printDirectoryFiles(args.directory || getParityDirectory(), directories);
  },
});
