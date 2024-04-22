import { attacks } from "@/assets/dungeons/data/attacks";
import type { AttackKey } from "@/models/dungeons/keys/spritesheet/AttackKey";
import { NotFoundError } from "@/models/error/NotFoundError";

export const getAttack = (attackId: AttackKey) => {
  const attack = attacks.find((a) => a.id === attackId);
  if (!attack) throw new NotFoundError(getAttack.name, attackId);
  return attack;
};
