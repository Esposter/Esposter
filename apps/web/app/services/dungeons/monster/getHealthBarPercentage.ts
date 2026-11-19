import type { Monster } from "#shared/models/dungeons/monster/Monster";

export const getHealthBarPercentage = (monster: Monster) =>
  (monster.status.health / monster.statistics.maxHealth) * 100;
