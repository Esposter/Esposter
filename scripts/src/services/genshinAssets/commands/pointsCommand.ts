import type { SubCommandsDef } from "citty";

import { readInteractiveMap } from "#src/services/genshinAssets/points/readInteractiveMap";
import { defineCommand } from "citty";

export const pointsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description: "Read the official Teyvat Interactive Map's label tree and point list into the references folder",
    name: "points",
  },
  run: async () => {
    console.log((await readInteractiveMap()).join("\n"));
  },
});
