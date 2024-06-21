import type { Monster } from "@/models/dungeons/monster/Monster";
import { generateRandomInteger } from "@/util/math/random/generateRandomInteger";

export const levelUp = (monster: Monster) => {
  monster.stats.level += 1;
  monster.stats.maxHp += 5 + generateRandomInteger(3);
  monster.stats.attack += 1 + generateRandomInteger(1);
};
