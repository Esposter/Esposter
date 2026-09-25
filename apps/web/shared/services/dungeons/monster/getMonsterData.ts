import type { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";

import { monstersData } from "#shared/assets/dungeons/data/monstersData";
import { NotFoundError } from "@esposter/shared";

// A copy rather than the definition itself, for the reason getById gives, keyed by the species rather than an id: a
// Monster's statistics and status are what gameplay goes on to change, and they must never reach the species every
// Later monster is built from
export const getMonsterData = (key: MonsterKey) => {
  const monsterData = monstersData.find(({ key: monsterKey }) => monsterKey === key);
  if (monsterData) return structuredClone(monsterData);
  else throw new NotFoundError(getMonsterData.name, key);
};
