import { monstersDetails } from "@/assets/dungeons/data/monstersDetails";
import type { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import { NotFoundError } from "@/models/error/NotFoundError";

export const getMonsterDetails = (key: MonsterKey) => {
  const monsterDetails = monstersDetails.find((m) => m.key === key);
  if (!monsterDetails) throw new NotFoundError(getMonsterDetails.name, key);
  return monsterDetails;
};
