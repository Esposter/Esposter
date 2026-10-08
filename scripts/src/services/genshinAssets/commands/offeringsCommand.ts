import type { SubCommandsDef } from "citty";

import { writeFrostbearingTreeLevels } from "#src/services/genshinAssets/offerings/writeFrostbearingTreeLevels";
import { defineCommand } from "citty";

export const offeringsCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the Frostbearing Tree's levels (the items each takes, its rewards) from the dump into genshin-world",
    name: "offerings",
  },
  run: () => {
    writeFrostbearingTreeLevels();
  },
});
