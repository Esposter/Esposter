import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildCraftingRecipes } from "#src/services/genshinAssets/crafting/buildCraftingRecipes";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const craftingCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the bench's recipes (the tiers, potions, baits, Condensed Resin and gadgets) and the instructions that open them from the dump to the game data",
    name: "crafting",
  },
  run: async ({ args }) => {
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: buildCraftingRecipes() },
        scopes: [GameDataset.Crafting],
      }),
    );
  },
});
