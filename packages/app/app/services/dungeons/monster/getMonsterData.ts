import type { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";

import { monstersData } from "@/assets/dungeons/data/monstersData";
import { NotFoundError } from "@esposter/shared";

export const getMonsterData = (key: MonsterKey) => {
  const monsterData = monstersData.find((m) => m.key === key);
  if (!monsterData) throw new NotFoundError(getMonsterData.name, key);
  return monsterData;
};
