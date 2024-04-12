import { monsters } from "@/assets/dungeons/data/monsters";
import type { MonsterName } from "@/models/dungeons/monster/MonsterName";

export const getMonster = (monsterName: MonsterName) => monsters.find((m) => m.monsterName === monsterName)!;
