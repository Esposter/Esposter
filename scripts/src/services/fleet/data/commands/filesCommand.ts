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
    // One directory is read at a time, its stats already batched within it, so a long list never holds every directory
    // Open at once, and each listing prints in input order as it is read
    const result = await getResultAsync(async () => {
      for (const directory of directories) {
        // oxlint-disable-next-line no-await-in-loop -- A directory is read before the next opens, so the open handles never stack
        const { files } = await readDirectory(join(parityDirectory, directory));
        console.info(JSON.stringify({ directory, files }));
      }
    });
    result.match(noop, (error) => {
      console.error(error);
      process.exitCode = FAILURE_EXIT_CODE;
    });
  },
});
