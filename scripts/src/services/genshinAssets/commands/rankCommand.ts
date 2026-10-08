import type { SubCommandsDef } from "citty";

import { writeAdventureRankTables } from "#src/services/genshinAssets/adventureRank/writeAdventureRankTables";
import { defineCommand } from "citty";

export const rankCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the Adventure Rank tables (each rank's EXP, the World Level locks and the enemies' World Level levels) from the dump into genshin-world",
    name: "rank",
  },
  run: () => {
    writeAdventureRankTables();
  },
});
