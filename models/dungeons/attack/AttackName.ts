import type { AttackId } from "@/models/dungeons/attack/AttackId";
import type { PrettifyName } from "@/util/types/PrettifyName";

type PrettifiedAttackId = {
  [P in AttackId]: PrettifyName<P>;
};

export type AttackName = PrettifiedAttackId[keyof PrettifiedAttackId];
