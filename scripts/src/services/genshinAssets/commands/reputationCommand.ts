import type { SubCommandsDef } from "citty";

import { writeMondstadtReputation } from "#src/services/genshinAssets/reputation/writeMondstadtReputation";
import { defineCommand } from "citty";

export const reputationCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write Mondstadt's Reputation from the dump into genshin-world: its levels and rewards, its requests and its weekly bounties",
    name: "reputation",
  },
  run: () => {
    writeMondstadtReputation();
  },
});
