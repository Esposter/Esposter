import type { SubCommandsDef } from "citty";

import { nameMonsterAssets } from "#src/services/genshinAssets/enemies/nameMonsterAssets";
import { readPlacedMonsterRows } from "#src/services/genshinAssets/enemies/readPlacedMonsterRows";
import { readAssetPathNames } from "#src/services/genshinAssets/world/readAssetPathNames";
import { defineCommand } from "citty";

export const monstersCommand: SubCommandsDef[string] = defineCommand({
  meta: {
    description:
      "Name the prefab, Animator controller and combat config of each enemy kind the regions place and of each boss through the asset index, one line per kind, and count each path hash the index names none of",
    name: "monsters",
  },
  run: async () => {
    const monsterRows = await readPlacedMonsterRows();
    const pathNames = await readAssetPathNames();
    let unnamed = 0;
    for (const monsterRow of monsterRows) {
      const { combatConfig, controller, prefab, unnamed: unnamedHashes } = nameMonsterAssets(monsterRow, pathNames);
      unnamed += unnamedHashes;
      console.log(
        `${monsterRow.id} ${monsterRow.monsterName}: prefab ${prefab ?? "unnamed"}, controller ${controller ?? "unnamed"}, combat config ${combatConfig ?? "unnamed"}`,
      );
    }
    console.log(`${unnamed} path hashes unnamed`);
  },
});
