import type { Monster } from "#shared/models/dungeons/monster/Monster";

import { getLevelExperience } from "@/services/dungeons/monster/getLevelExperience";
import { createRandomInteger } from "@/util/math/random/createRandomInteger";

export const levelUp = (monster: Monster) => {
  monster.status.experience -= getLevelExperience(monster.statistics.level);
  monster.statistics.level += 1;
  monster.statistics.maxHealth += 5 + createRandomInteger(3);
  monster.statistics.attack += 1 + createRandomInteger(1);
  monster.statistics.defense += 1 + createRandomInteger(1);
};
