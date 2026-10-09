import type { SubCommandsDef } from "citty";

import { writeMondstadtCommissions } from "#src/services/genshinAssets/commissions/writeMondstadtCommissions";
import { defineCommand } from "citty";

export const commissionsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write Mondstadt's daily tasks from the dump into genshin-world: each task, its reward tiers and Katheryne's bonus by Adventure Rank band",
    name: "commissions",
  },
  run: () => {
    writeMondstadtCommissions();
  },
});
