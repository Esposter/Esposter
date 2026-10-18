import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { fitRegionOutcrops } from "#src/services/genshinAssets/fit/fitRegionOutcrops";
import { defineCommand } from "citty";

export const outcropPlacesCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Write each Ley Line Blossom of the official map, carried into its region's axes as the waypoints are, into its region's outcrop places",
    name: "outcrop-places",
  },
  run: async ({ args }) => {
    console.log(await fitRegionOutcrops({ isDryRun: args["dry-run"] }));
  },
});
