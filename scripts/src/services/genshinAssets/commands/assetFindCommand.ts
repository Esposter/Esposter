import type { SubCommandsDef } from "citty";

import { GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import { readMeshAssets } from "#src/services/genshinAssets/shared/readMeshAssets";
import { defineCommand } from "citty";

export const assetFindCommand: SubCommandsDef[string] = defineCommand({
  args: {
    name: {
      description: "The mesh's name, exactly as the asset index names it, such as Stages_MdGoddess01_Base_Lod0",
      required: true,
      type: "positional",
    },
  },
  meta: {
    description:
      "Print the path ID and block of each mesh the game's asset index names, one JSON line each. Refuses a name no mesh holds, since a prefab's own name is not in the index",
    name: "asset-find",
  },
  run: async ({ args }) => {
    for (const { block, pathId } of await readMeshAssets(args.name, GENSHIN_ANIMESTUDIO_OPTIONS))
      console.log(JSON.stringify({ block, pathId }));
  },
});
