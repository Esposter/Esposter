import type { SubCommandsDef } from "citty";

import { writeMondstadtExplorationAreas } from "#src/services/genshinAssets/exploration/writeMondstadtExplorationAreas";
import { defineCommand } from "citty";

export const explorationCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write Mondstadt's areas' exploration (each total and the doings its progress counts) from the dump into genshin-world",
    name: "exploration",
  },
  run: () => {
    writeMondstadtExplorationAreas();
  },
});
