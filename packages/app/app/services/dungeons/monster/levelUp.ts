import type { Monster } from "@/models/dungeons/monster/Monster";

import { createRandomInteger } from "#shared/util/math/random/createRandomInteger";
import { calculateLevelExperience } from "@/services/dungeons/monster/calculateLevelExperience";

export const levelUp = (monster: Monster) => {
  monster.status.exp -= calculateLevelExperience(monster.stats.level);
  monster.stats.level += 1;
  monster.stats.maxHp += 5 + createRandomInteger(3);
  monster.stats.attack += 1 + createRandomInteger(1);
};
