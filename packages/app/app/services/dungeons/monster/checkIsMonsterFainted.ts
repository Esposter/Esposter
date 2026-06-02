import type { Monster } from "#shared/models/dungeons/monster/Monster";

export const checkIsMonsterFainted = (monster: Monster) => monster.status.hp <= 0;
