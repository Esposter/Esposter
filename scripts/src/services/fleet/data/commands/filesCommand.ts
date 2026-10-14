import type { SubCommandsDef } from "citty";

import { printDirectoryFiles } from "#src/services/fleet/data/commands/printDirectoryFiles";
import { getParityDirectory } from "#src/services/fleet/data/getParityDirectory";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

// `pnpm ai:fleet:data files <dir>...` — one JSON line per directory with its direct files, the directories named as arguments
export const filesCommand: SubCommandsDef[string] = defineCommand({
  args: { directory: { description: "The parity directory the named directories are under", type: "string" } },
  meta: { description: "Print the direct files of each named directory, one JSON line each", name: "files" },
  run: async ({ args }) => {
    // Named as arguments only: stdin is never read, since a piped one can stay open and hang the command
    if (args._.length === 0) throw new InvalidOperationError(Operation.Read, "directories", "none was named");
    await printDirectoryFiles(args.directory || getParityDirectory(), args._);
  },
});
