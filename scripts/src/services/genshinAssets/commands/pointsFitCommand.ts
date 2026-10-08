import type { SubCommandsDef } from "citty";

import { fitInteractiveMap } from "#src/services/genshinAssets/fit/fitInteractiveMap";
import { defineCommand } from "citty";

export const pointsFitCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description: "Fit the official map's statues and waypoints to the scene's transport points, with the residual",
    name: "points-fit",
  },
  run: async () => {
    console.log(await fitInteractiveMap());
  },
});
