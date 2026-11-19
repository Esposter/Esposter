import type { SubCommandsDef } from "citty";

import { DATA_FOLDERS, DEFAULT_PARITY_DIRECTORY } from "#src/services/fleet/data/constants";
import { getManifest } from "#src/services/fleet/data/getManifest";
import { getParityDirectory } from "#src/services/fleet/data/getParityDirectory";
import { resolveFolders } from "#src/services/fleet/data/resolveFolders";
import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

// `pnpm ai:fleet:data manifest` — the directory digests of this machine's game data, printed as one JSON object
export const manifestCommand: SubCommandsDef[string] = defineCommand({
  args: {
    directory: {
      description: `The parity directory to digest, GENSHIN_PARITY_DIRECTORY or ${DEFAULT_PARITY_DIRECTORY} by default`,
      type: "string",
    },
    folders: { default: DATA_FOLDERS.join(","), description: "The comma-separated folders to digest", type: "string" },
  },
  meta: { description: "Print the directory digests of the game data as JSON", name: "manifest" },
  run: async ({ args }) => {
    (
      await getResultAsync(() => getManifest(args.directory || getParityDirectory(), resolveFolders(args.folders)))
    ).match(
      (manifest) => {
        console.info(JSON.stringify(manifest));
      },
      (error) => {
        throw new InvalidOperationError(Operation.Read, "manifest", error.message);
      },
    );
  },
});
