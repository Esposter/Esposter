import { z } from "zod";

export enum MonsterKey {
  Aquavalor = "Aquavalor",
  Carnodusk = "Carnodusk",
  Frostsaber = "Frostsaber",
  Ignivolt = "Ignivolt",
  Iguanignite = "Iguanignite",
}

export const monsterKeySchema = z.enum(MonsterKey) satisfies z.ZodType<MonsterKey>;
