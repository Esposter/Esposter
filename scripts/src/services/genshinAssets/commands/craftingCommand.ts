import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { buildCraftingBenchPlaces } from "#src/services/genshinAssets/crafting/buildCraftingBenchPlaces";
import { buildCraftingRecipes } from "#src/services/genshinAssets/crafting/buildCraftingRecipes";
import { defineCommand } from "citty";
import { GameDataset } from "genshin-world";

export const craftingCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Publish the bench's recipes (the tiers, potions, baits, Condensed Resin and gadgets) and the instructions that open them from the dump, and the bench's place in its region from the scene's birth records, to the game data",
    name: "crafting",
  },
  run: async ({ args }) => {
    const { notes, objects } = await buildCraftingBenchPlaces();
    console.log(notes.join("\n"));
    console.log(
      await publishGameDataStep({
        isDryRun: args["dry-run"],
        publication: { indexes: {}, objects: { ...buildCraftingRecipes(), ...objects } },
        scopes: [GameDataset.Crafting, GameDataset.CraftingBenchPlaces],
      }),
    );
  },
});
