import type { SubCommandsDef } from "citty";

import { fitRegionWaypoints } from "#src/services/genshinAssets/fit/fitRegionWaypoints";
import { dryRunArgs } from "#src/services/shared/dryRunArgs";
import { defineCommand } from "citty";

export const waypointsCommand: SubCommandsDef[string] = defineCommand({
  args: { ...dryRunArgs },
  meta: {
    description:
      "Write each Teleport Waypoint and Statue of the New Moon of the official map, paired with the scene's transport point it stands at, into its region's landmarks",
    name: "waypoints",
  },
  run: async ({ args }) => {
    console.log(await fitRegionWaypoints({ isDryRun: args["dry-run"] }));
  },
});
