import { collectEnemyKindIds } from "#src/services/genshinAssets/enemies/collectEnemyKindIds";
import { REGIONS_DIRECTORY } from "#src/services/genshinAssets/enemies/constants";
import { WORLD_DATA_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The enemy kinds the regions' camps place, read from the region files the world ships: the kinds a monster of the Abyss
// Can be fought as
export const readPlacedEnemyKindIds = (): number[] => {
  const regionsDirectory = join(WORLD_DATA_DIRECTORY, REGIONS_DIRECTORY);
  return collectEnemyKindIds(
    readdirSync(regionsDirectory).map((filename) =>
      parseMachineJson<{ enemyCamps: { members: { enemyKindId: number }[] }[] }>(
        readFileSync(join(regionsDirectory, filename), "utf8"),
      ),
    ),
  );
};
