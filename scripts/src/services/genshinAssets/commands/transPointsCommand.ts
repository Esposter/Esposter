import type { SubCommandsDef } from "citty";

import { writeTransPointRewards } from "#src/services/genshinAssets/transPoints/writeTransPointRewards";
import { defineCommand } from "citty";

export const transPointsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the open world's transport point rewards (the Adventure EXP and Primogems each first unlock pays) from the dump into genshin-world",
    name: "trans-points",
  },
  run: () => {
    writeTransPointRewards();
  },
});
