import type { SubCommandsDef } from "citty";

import { writeGatheringPlaces } from "#src/services/genshinAssets/gathering/writeGatheringPlaces";
import { defineCommand } from "citty";

export const gatheringCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write each plant and specialty the official map marks, placed by the fit, as one slice per region and its items in genshin-world",
    name: "gathering",
  },
  run: async () => {
    console.log(await writeGatheringPlaces());
  },
});
