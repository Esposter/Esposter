import type { SubCommandsDef } from "citty";

import { writeEnemyKinds } from "#src/services/genshinAssets/enemies/writeEnemyKinds";
import { defineCommand } from "citty";

export const enemiesCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Write the enemy kinds the regions' camps place, read from the game's monster, curve and archive tables in the text dump, and every level curve they name, as the world's data",
    name: "enemies",
  },
  run: async () => {
    console.log((await writeEnemyKinds()).join("\n"));
  },
});
