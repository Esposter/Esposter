import type { SubCommandsDef } from "citty";

import { writeExpeditionLimits } from "#src/services/genshinAssets/expeditions/writeExpeditionLimits";
import { writeMondstadtExpeditions } from "#src/services/genshinAssets/expeditions/writeMondstadtExpeditions";
import { defineCommand } from "citty";

export const expeditionsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write Mondstadt's expedition places (their conditions, durations and reward items) as a slice of genshin-world, and the Adventure Ranks that raise the expedition limit",
    name: "expeditions",
  },
  run: async () => {
    console.log(writeMondstadtExpeditions());
    console.log(await writeExpeditionLimits());
  },
});
