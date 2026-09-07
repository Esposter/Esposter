import type { MonsterFileKey } from "#shared/models/dungeons/keys/MonsterFileKey";

import { monstersData } from "#shared/assets/dungeons/data/monstersData";
import { NotFoundError } from "@esposter/shared";

export const getMonsterData = (key: MonsterFileKey) => {
  const monsterData = monstersData.find(({ key: monsterKey }) => monsterKey === key);
  if (!monsterData) throw new NotFoundError(getMonsterData.name, key);
  return monsterData;
};
