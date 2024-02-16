import { type PlayerAttackOption } from "@/models/dungeons/battle/menu/PlayerAttackOption";
import { type Monster } from "@/models/dungeons/battle/monster/Monster";
import { getAttackName } from "@/services/dungeons/battle/attack/getAttackName";

export const getAttackNames = (monster: Monster): PlayerAttackOption[] => {
  const attackNames: PlayerAttackOption[] = [];
  // We will only use this to display our attack options in the grid
  // which supports a maximum of 4 attack options
  for (let i = 0; i < 4; i++) attackNames.push(getAttackName(monster.attackIds[i]));
  return attackNames;
};
