import type { AbyssTables } from "#src/models/spiralAbyss/AbyssTables";

import { readAbyssBenedictionChoices } from "#src/services/spiralAbyss/readAbyssBenedictionChoices";
import { readAbyssEnemyKinds } from "#src/services/spiralAbyss/readAbyssEnemyKinds";
import { readAbyssFloorRewards } from "#src/services/spiralAbyss/readAbyssFloorRewards";
import { readAbyssFloors } from "#src/services/spiralAbyss/readAbyssFloors";
import { readAbyssPeriods } from "#src/services/spiralAbyss/readAbyssPeriods";

// Reads the Spiral Abyss's five tables together
export const readAbyssTables = async (gameDataBaseUrl: string): Promise<AbyssTables> => {
  const [periods, floors, enemyKinds, benedictionChoices, rewards] = await Promise.all([
    readAbyssPeriods(gameDataBaseUrl),
    readAbyssFloors(gameDataBaseUrl),
    readAbyssEnemyKinds(gameDataBaseUrl),
    readAbyssBenedictionChoices(gameDataBaseUrl),
    readAbyssFloorRewards(gameDataBaseUrl),
  ]);
  return { benedictionChoices, enemyKinds, floors, periods, rewards };
};
