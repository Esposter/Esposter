import { z } from "zod";

export const MonsterKey = {
  Aquavalor: "Aquavalor",
  Carnodusk: "Carnodusk",
  Frostsaber: "Frostsaber",
  Ignivolt: "Ignivolt",
  Iguanignite: "Iguanignite",
} as const;
export type MonsterKey = keyof typeof MonsterKey;

export const monsterKeySchema = z.nativeEnum(MonsterKey) satisfies z.ZodType<MonsterKey>;
