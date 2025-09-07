import type { AttackId } from "#shared/models/dungeons/attack/AttackId";

import { attacks } from "@/assets/dungeons/data/attacks";
import { NotFoundError } from "@esposter/shared";

export const getAttack = (attackId: AttackId) => {
  const attack = attacks.find(({ id }) => id === attackId);
  if (!attack) throw new NotFoundError(getAttack.name, attackId);
  return attack;
};
