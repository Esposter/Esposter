import type { SubCommandsDef } from "citty";

import { FAILURE_EXIT_CODE } from "#src/services/fleet/data/constants";
import { getParityDirectory } from "#src/services/fleet/data/getParityDirectory";
import { readDirectory } from "#src/services/fleet/data/readDirectory";
import { readStandardInput } from "#src/services/fleet/data/readStandardInput";
import { getResultAsync, noop } from "@esposter/shared";
import { defineCommand } from "citty";
import { join } from "node:path";

// `pnpm ai:fleet:data files <dir>...` — one JSON line per directory with its direct files, the directories named as
// Arguments or, with none, one per line on stdin
export const filesCommand: SubCommandsDef[string] = defineCommand({
  args: { directory: { description: "The parity directory the named directories are under", type: "string" } },
  meta: { description: "Print the direct files of each named directory, one JSON line each", name: "files" },
  run: async ({ args }) => {
    const parityDirectory = args.directory || getParityDirectory();
    const directories = args._.length > 0 ? args._ : await readStandardInput();
    const result = await getResultAsync(async () => {
      const listings = await Promise.all(
        directories.map(async (directory) => ({
          directory,
          files: (await readDirectory(join(parityDirectory, directory))).files,
        })),
      );
      for (const listing of listings) console.info(JSON.stringify(listing));
    });
    result.match(noop, (error) => {
      console.error(error);
      process.exitCode = FAILURE_EXIT_CODE;
    });
  },
});
