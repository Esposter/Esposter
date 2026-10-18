import type { SubCommandsDef } from "citty";

import { dryRunArgs } from "#src/services/gameData/commands/dryRunArgs";
import { fitRegionWaypoints } from "#src/services/genshinAssets/fit/fitRegionWaypoints";
import { defineCommand } from "citty";

export const waypointsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Write each Teleport Waypoint of the official map, paired with the scene's transport point it stands at, into its region's landmarks",
    name: "waypoints",
  },
  run: async ({ args }) => {
    console.log(await fitRegionWaypoints({ isDryRun: args["dry-run"] }));
  },
});
