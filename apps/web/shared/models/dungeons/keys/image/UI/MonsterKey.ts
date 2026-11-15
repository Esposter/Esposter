import { z } from "zod";

export const MonsterKey = {
  Aquavalor: "Aquavalor",
  Carnodusk: "Carnodusk",
  Frostsaber: "Frostsaber",
  Ignivolt: "Ignivolt",
  Iguanignite: "Iguanignite",
} as const;
export type MonsterKey = (typeof MonsterKey)[keyof typeof MonsterKey];

export const monsterKeySchema = z.enum(MonsterKey) satisfies z.ZodType<MonsterKey>;

export const MonsterKeys = Object.values(MonsterKey);
