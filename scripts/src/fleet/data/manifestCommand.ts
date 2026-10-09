import { DATA_FOLDERS } from "#src/services/fleet/data/constants";
import { FAILURE_EXIT_CODE } from "#src/services/fleet/data/constants";
import { getManifest } from "#src/services/fleet/data/getManifest";
import { getParityDirectory } from "#src/services/fleet/data/getParityDirectory";
import { resolveFolders } from "#src/services/fleet/data/resolveFolders";
import { getResultAsync } from "@esposter/shared";
import { defineCommand } from "citty";

// `pnpm ai:fleet:data manifest` — the directory digests of this machine's game data, printed as one JSON object
export const manifestCommand = defineCommand({
  args: {
    directory: {
      description: "The parity directory to digest, GENSHIN_PARITY_DIRECTORY or ~/Esposter/genshin-parity by default",
      type: "string",
    },
    folders: { default: DATA_FOLDERS.join(","), description: "The comma-separated folders to digest", type: "string" },
  },
  meta: { description: "Print the directory digests of the game data as JSON", name: "manifest" },
  run: async ({ args }) =>
    (
      await getResultAsync(() => getManifest(args.directory || getParityDirectory(), resolveFolders(args.folders)))
    ).match(
      (manifest) => console.info(JSON.stringify(manifest)),
      (error) => {
        console.error(error);
        process.exitCode = FAILURE_EXIT_CODE;
      },
    ),
});
