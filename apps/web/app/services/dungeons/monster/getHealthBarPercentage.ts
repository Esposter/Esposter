import type { Monster } from "#shared/models/dungeons/monster/Monster";

import { getHealthRate } from "#src/services/dungeons/monster/getHealthRate";

export const getHealthBarPercentage = (monster: Monster) => getHealthRate(monster) * 100;
