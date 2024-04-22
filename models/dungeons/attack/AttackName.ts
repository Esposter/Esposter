import type { AttackId } from "@/models/dungeons/attack/AttackId";
import type { PrettifyName } from "@/util/types/PrettifyName";
import { z } from "zod";

type PrettifiedAttackId = {
  [P in AttackId]: PrettifyName<P>;
};

export type AttackName = PrettifiedAttackId[keyof PrettifiedAttackId];
// The type is some crazy string literal manipulation so let's just loosen
// the zod validation since we don't care as long as the name is a string
export const attackNameSchema = z.string();
