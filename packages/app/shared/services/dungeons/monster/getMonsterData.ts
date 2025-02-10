import type { FileKey } from "#shared/generated/phaser/FileKey";

import { monstersData } from "#shared/assets/dungeons/data/monstersData";
import { NotFoundError } from "@esposter/shared";

export const getMonsterData = (key: FileKey) => {
  const monsterData = monstersData.find((m) => m.key === key);
  if (!monsterData) throw new NotFoundError(getMonsterData.name, key);
  return monsterData;
};
