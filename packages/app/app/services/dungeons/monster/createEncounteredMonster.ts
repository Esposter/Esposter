import type { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";

import { Monster } from "#shared/models/dungeons/monster/Monster";
import { calculateLevelExperience } from "@/services/dungeons/monster/calculateLevelExperience";
import { levelUp } from "@/services/dungeons/monster/levelUp";

// Wild encounters spawn above the species' base level by replaying the normal level-up rolls,
// So a scaled spawn is statistically identical to a monster trained to that level.
export const createEncounteredMonster = (key: MonsterKey, level: number) => {
  const monster = new Monster(key);
  while (monster.stats.level < level) {
    monster.status.exp = calculateLevelExperience(monster.stats.level);
    levelUp(monster);
  }
  monster.status.hp = monster.stats.maxHp;
  return monster;
};
