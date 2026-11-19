import type { Monster } from "#shared/models/dungeons/monster/Monster";

export const getHealthRate = (monster: Monster) => monster.status.health / monster.statistics.maxHealth;
