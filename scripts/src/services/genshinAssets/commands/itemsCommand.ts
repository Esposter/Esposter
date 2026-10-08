import type { SubCommandsDef } from "citty";

import { writeItems } from "#src/services/genshinAssets/items/writeItems";
import { defineCommand } from "citty";

export const itemsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the materials the world's drops name, read from the game's material table in the text dump, as the world's data",
    name: "items",
  },
  run: async () => {
    console.log(await writeItems());
  },
});
