import type { Monster } from "#shared/models/dungeons/monster/Monster";

import { checkIsMonsterFainted } from "#src/services/dungeons/monster/checkIsMonsterFainted";

export const checkHasOtherStandingMonster = (monsters: Monster[], activeMonster: Monster) =>
  monsters.some((monster) => monster.id !== activeMonster.id && !checkIsMonsterFainted(monster));
