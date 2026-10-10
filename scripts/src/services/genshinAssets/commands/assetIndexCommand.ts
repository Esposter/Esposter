import type { CommandDef } from "citty";

import { ensureAssetPathIndex } from "#src/services/genshinAssets/world/ensureAssetPathIndex";
import { defineCommand } from "citty";

export const assetIndexCommand: CommandDef = defineCommand({
  meta: {
    description:
      "Fetch the community's asset path index into the asset-index folder when it is missing, and print its path",
    name: "asset-index",
  },
  run: async () => {
    console.log(await ensureAssetPathIndex());
  },
});
