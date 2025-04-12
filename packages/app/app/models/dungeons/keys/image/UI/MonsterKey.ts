import type { Type } from "arktype";

import { type } from "arktype";

export enum MonsterKey {
  Aquavalor = "Aquavalor",
  Carnodusk = "Carnodusk",
  Frostsaber = "Frostsaber",
  Ignivolt = "Ignivolt",
  Iguanignite = "Iguanignite",
}

export const monsterKeySchema = type.valueOf(MonsterKey) satisfies Type<MonsterKey>;
