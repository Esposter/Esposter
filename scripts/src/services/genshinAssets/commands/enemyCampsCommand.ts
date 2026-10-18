import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { fitRegionCamps } from "#src/services/genshinAssets/fit/fitRegionCamps";
import { defineCommand } from "citty";

export const enemyCampsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Cluster each region's enemy marks of the official map into camps, fitted into the region's axes, and write them into its region's enemy camps",
    name: "enemy-camps",
  },
  run: async ({ args }) => {
    console.log(await fitRegionCamps({ isDryRun: args["dry-run"] }));
  },
});
