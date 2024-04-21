import { monsters } from "@/assets/dungeons/data/monsters";
import type { MonsterName } from "@/models/dungeons/monster/MonsterName";
import { NotFoundError } from "@/models/error/NotFoundError";
import { DataType } from "@/models/error/dungeons/DataType";

export const getMonsterDetails = (monsterName: MonsterName) => {
  const monster = monsters.find((m) => m.monsterName === monsterName);
  if (!monster) throw new NotFoundError(DataType.Monster, monsterName);
  return monster;
};
