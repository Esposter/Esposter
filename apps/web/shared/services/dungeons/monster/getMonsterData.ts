import type { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";

import { monstersData } from "#shared/assets/dungeons/data/monstersData";
import { NotFoundError } from "@esposter/shared";

// A copy rather than the definition itself, for the reason getItem gives: a monster's statistics and status are
// What gameplay goes on to change, and they must never reach the species every later monster is built from
export const getMonsterData = (key: MonsterKey) => {
  const monsterData = monstersData.find(({ key: monsterKey }) => monsterKey === key);
  if (monsterData) return structuredClone(monsterData);
  else throw new NotFoundError(getMonsterData.name, key);
};
