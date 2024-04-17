import { attacks } from "@/assets/dungeons/data/attacks";
import type { AttackId } from "@/models/dungeons/attack/AttackId";
import { NotFoundError } from "@/models/error/NotFoundError";
import { DataType } from "@/models/error/dungeons/DataType";

export const getAttack = (attackId: AttackId) => {
  const attack = attacks.find((a) => a.id === attackId);
  if (!attack) throw new NotFoundError(DataType.Attack, attackId);
  return attack;
};
