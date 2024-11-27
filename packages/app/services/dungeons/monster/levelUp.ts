import type { Monster } from "@/models/dungeons/monster/Monster";

import { calculateLevelExperience } from "@/services/dungeons/monster/calculateLevelExperience";
import { generateRandomInteger } from "@/shared/util/math/random/generateRandomInteger";

export const levelUp = (monster: Monster) => {
  monster.status.exp -= calculateLevelExperience(monster.stats.level);
  monster.stats.level += 1;
  monster.stats.maxHp += 5 + generateRandomInteger(3);
  monster.stats.attack += 1 + generateRandomInteger(1);
};
