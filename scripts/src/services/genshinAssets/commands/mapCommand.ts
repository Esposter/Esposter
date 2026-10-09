import type { SubCommandsDef } from "citty";

import { buildAssetMap } from "#src/services/genshinAssets/blocks/buildAssetMap";
import { parseNumbers } from "#src/services/shared/parseNumbers";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { defineCommand } from "citty";

export const mapCommand: SubCommandsDef[string] = defineCommand({
  args: {
    shards: {
      description:
        "How many AnimeStudio runs map the blocks at once, each on its own share of their bytes: the performance cores by default",
      type: "string",
    },
  },
  meta: {
    description: "Map every asset in the installed game's blocks, once a patch, with the game closed",
    name: "map",
  },
  run: ({ args }) => {
    const [shards] = args.shards ? parseNumbers(args.shards, "shards", 1) : [];
    if (shards !== undefined && (!Number.isInteger(shards) || shards < 1))
      throw new InvalidOperationError(Operation.Read, "shards", `${shards} is not a whole number of runs`);
    return buildAssetMap(shards);
  },
});
