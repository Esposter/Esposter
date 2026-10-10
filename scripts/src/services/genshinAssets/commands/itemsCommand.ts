import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildItems } from "#src/services/genshinAssets/items/buildItems";
import { buildReliquarySets } from "#src/services/genshinAssets/items/buildReliquarySets";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const itemsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the materials the world's drops name, read from the game's material table in the text dump, and the artifact sets, to the game data",
    name: "items",
  },
  run: async ({ args }) => {
    const objects = { ...(await buildItems()), ...buildReliquarySets() };
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects },
        scopes: [GameDataset.Items],
      }),
    );
  },
});
