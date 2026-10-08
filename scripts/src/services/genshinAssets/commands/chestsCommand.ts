import type { SubCommandsDef } from "citty";

import { writeChestPlaces } from "#src/services/genshinAssets/chests/writeChestPlaces";
import { defineCommand } from "citty";

export const chestsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write each chest the official map marks, carried into the scene by the fit, as one slice per region in genshin-world",
    name: "chests",
  },
  run: async () => {
    console.log(await writeChestPlaces());
  },
});
