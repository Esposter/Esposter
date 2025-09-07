import type { Monster } from "#shared/models/dungeons/monster/Monster";

export const isMonsterFainted = (monster: Monster) => monster.status.hp <= 0;
