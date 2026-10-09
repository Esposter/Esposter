import type { SubCommandsDef } from "citty";

import { writeResidents } from "#src/services/genshinAssets/residents/writeResidents";
import { defineCommand } from "citty";

export const residentsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write each region's residents into its region data from the scene's NPC birth records, the game's names and talks, and the fit's regions",
    name: "residents",
  },
  run: async () => {
    console.log(await writeResidents());
  },
});
