import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { writeResidents } from "#src/services/genshinAssets/residents/writeResidents";
import { defineCommand } from "citty";

export const residentsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Write each region's residents into its region data from the scene's NPC birth records, the game's names and talks, and the fit's regions",
    name: "residents",
  },
  run: async ({ args }) => {
    console.log(await writeResidents({ isDryRun: args["dry-run"] }));
  },
});
