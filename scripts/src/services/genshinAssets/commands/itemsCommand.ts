import type { SubCommandsDef } from "citty";

import { writeItems } from "#src/services/genshinAssets/items/writeItems";
import { writeReliquarySets } from "#src/services/genshinAssets/items/writeReliquarySets";
import { defineCommand } from "citty";

export const itemsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the materials the world's drops name, read from the game's material table in the text dump, and the artifact sets, as the world's data",
    name: "items",
  },
  run: async () => {
    console.log(await writeItems());
    console.log(await writeReliquarySets());
  },
});
