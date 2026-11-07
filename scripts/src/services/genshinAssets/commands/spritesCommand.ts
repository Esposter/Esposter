import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { describeSpriteAssets, exportSpritesByName } from "#src/services/genshinAssets/sprites/exportSpritesByName";
import { parseNames } from "#src/services/shared/parseNames";
import { defineCommand } from "citty";

export const spritesCommand: SubCommandsDef[string] = defineCommand({
  args: {
    names: {
      description: "The sprites and textures to export, comma-separated, each by its exact name",
      required: true,
      type: "positional",
    },
    block: {
      description: "Only the rows of this block, such as 00/11790361.blk, where a name is held by several",
      required: false,
      type: "string",
    },
    ...dryRunArgs,
  },
  meta: {
    description:
      "Export the named sprites and textures the asset index holds into the references folder, a sprite cut from its atlas",
    name: "sprites",
  },
  run: async ({ args }) => {
    const names = [...new Set(parseNames(args.names, "names"))];
    console.log(
      args["dry-run"]
        ? (await describeSpriteAssets(names, args.block)).join("\n")
        : await exportSpritesByName(names, args.block),
    );
  },
});
