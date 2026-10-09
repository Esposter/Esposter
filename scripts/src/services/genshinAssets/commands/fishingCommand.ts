import type { SubCommandsDef } from "citty";

import { writeFishingPoints } from "#src/services/genshinAssets/fishing/writeFishingPoints";
import { writeFishingTables } from "#src/services/genshinAssets/fishing/writeFishingTables";
import { defineCommand } from "citty";

export const fishingCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the fishing points of the official map by region, the fish, their rods and each region's fishing pools as slices of genshin-world",
    name: "fishing",
  },
  run: async () => {
    console.log(await writeFishingPoints());
    console.log(await writeFishingTables());
  },
});
