import type { SubCommandsDef } from "citty";

import { adoptCabMap } from "#src/services/genshinAssets/blocks/adoptCabMap";
import { buildAssetMap } from "#src/services/genshinAssets/blocks/buildAssetMap";
import { placeCabMap } from "#src/services/genshinAssets/blocks/placeCabMap";
import { writeAssetIndex } from "#src/services/genshinAssets/blocks/writeAssetIndex";
import { ANIMESTUDIO_CAB_MAP_PATH, ASSET_MAP_PATH, CAB_MAP_PATH } from "#src/services/genshinAssets/shared/constants";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";
import { existsSync } from "node:fs";

export const mapCommand: SubCommandsDef[string] = defineCommand({
  args: {
    index: {
      description: "Write the asset index again from the asset map the last mapping wrote, without mapping the blocks",
      type: "boolean",
    },
    shards: {
      description:
        "How many AnimeStudio runs map the blocks at once, each on its own share of their bytes: the performance cores by default",
      type: "string",
    },
  },
  meta: {
    description:
      "Map every asset in the installed game's blocks with the game closed; skipped while the map is on disk, so a new patch deletes it first",
    name: "map",
  },
  run: async ({ args }) => {
    if (args.index) {
      console.log(`${await writeAssetIndex()} assets indexed`);
      return;
    }
    const [shards] = args.shards ? parseNumbers(args.shards, "shards", 1) : [];
    if (shards !== undefined && (!Number.isInteger(shards) || shards < 1))
      throw new InvalidOperationError(Operation.Read, "shards", `${shards} is not a whole number of runs`);
    if (adoptCabMap(ANIMESTUDIO_CAB_MAP_PATH, CAB_MAP_PATH))
      console.log(`adopted ${ANIMESTUDIO_CAB_MAP_PATH} into ${CAB_MAP_PATH}`);
    if (existsSync(CAB_MAP_PATH) && existsSync(ASSET_MAP_PATH)) {
      placeCabMap();
      console.log(`already mapped: ${CAB_MAP_PATH} exists; delete it to map the blocks again`);
      return;
    }
    return buildAssetMap(shards);
  },
});
