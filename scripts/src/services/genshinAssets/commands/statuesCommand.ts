import type { SubCommandsDef } from "citty";

import { writeStatueLevels } from "#src/services/genshinAssets/statues/writeStatueLevels";
import { defineCommand } from "citty";

export const statuesCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write Mondstadt's Statue of The Seven levels (the Oculi each takes, its rewards and stamina) from the dump into genshin-world",
    name: "statues",
  },
  run: () => {
    writeStatueLevels();
  },
});
