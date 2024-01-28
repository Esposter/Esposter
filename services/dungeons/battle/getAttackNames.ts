import { type PlayerAttackOption } from "@/models/dungeons/battle/UI/menu/PlayerAttackOption";
import { type Monster } from "@/models/dungeons/battle/monsters/Monster";
import { getAttack } from "@/services/dungeons/battle/getAttack";
import { BLANK_VALUE } from "@/services/dungeons/constants";

export const getAttackNames = (monster: Monster): PlayerAttackOption[] => {
  const attackNames: PlayerAttackOption[] = [];
  for (let i = 0; i < 4; i++) {
    const attackId = monster.attackIds[i];
    const attack = getAttack(attackId);
    attackNames.push(attack?.name ?? BLANK_VALUE);
  }
  return attackNames;
};
