import type { SubCommandsDef } from "citty";

import { buildAssetMap } from "#src/services/genshinAssets/blocks/buildAssetMap";
import { defineCommand } from "citty";

export const mapCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description: "Map every asset in the installed game's blocks, once a patch, with the game closed",
    name: "map",
  },
  run: () => buildAssetMap(),
});
