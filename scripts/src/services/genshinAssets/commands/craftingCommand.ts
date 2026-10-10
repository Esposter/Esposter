import type { SubCommandsDef } from "citty";

import { writeCraftingRecipes } from "#src/services/genshinAssets/crafting/writeCraftingRecipes";
import { defineCommand } from "citty";

export const craftingCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the bench's recipes (the tiers, potions, baits, Condensed Resin and gadgets) and the instructions that open them from the dump into genshin-world",
    name: "crafting",
  },
  run: () => {
    writeCraftingRecipes();
  },
});
