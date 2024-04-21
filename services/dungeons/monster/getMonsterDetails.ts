import { monstersDetails } from "@/assets/dungeons/data/monstersDetails";
import type { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import { NotFoundError } from "@/models/error/NotFoundError";
import { DataType } from "@/models/error/dungeons/DataType";

export const getMonsterDetails = (key: MonsterKey) => {
  const monsterDetails = monstersDetails.find((m) => m.key === key);
  if (!monsterDetails) throw new NotFoundError(DataType.Monster, key);
  return monsterDetails;
};
