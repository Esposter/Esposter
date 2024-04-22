import type { AttackKey } from "@/models/dungeons/keys/spritesheet/AttackKey";
import type { PrettifyName } from "@/util/types/PrettifyName";
import { z } from "zod";

type PrettifiedAttackKey = {
  [P in AttackKey]: PrettifyName<P>;
};

export type AttackName = PrettifiedAttackKey[keyof PrettifiedAttackKey];
// The type is some crazy string literal manipulation so let's just loosen
// the zod validation since we don't care as long as the name is a string
export const attackNameSchema = z.string();
