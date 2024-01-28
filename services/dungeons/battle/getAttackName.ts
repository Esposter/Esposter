import { type AttackId } from "@/models/dungeons/attack/AttackId";
import { getAttack } from "@/services/dungeons/battle/getAttack";
import { BLANK_VALUE } from "@/services/dungeons/constants";

export const getAttackName = (attackId: AttackId) => {
  const attack = getAttack(attackId);
  return attack?.name ?? BLANK_VALUE;
};
