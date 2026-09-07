import type { AttackId } from "#shared/models/dungeons/attack/AttackId";
import type { MonsterKey } from "#shared/models/dungeons/keys/MonsterKey";
import type { Statistics } from "#shared/models/dungeons/monster/Statistics";
import type { Status } from "#shared/models/dungeons/monster/Status";

import { attackIdSchema } from "#shared/models/dungeons/attack/AttackId";
import { monsterKeySchema } from "#shared/models/dungeons/keys/MonsterKey";
import { statisticsSchema } from "#shared/models/dungeons/monster/Statistics";
import { statusSchema } from "#shared/models/dungeons/monster/Status";
import { getMonsterData } from "#shared/services/dungeons/monster/getMonsterData";
import { createUniqueArraySchema } from "@esposter/shared";
import { v7 } from "uuid";
import { z } from "zod";

export class Monster {
  declare attackIds: AttackId[];
  id: string = v7();
  declare key: MonsterKey;
  declare statistics: Statistics;
  declare status: Status;

  constructor(key: MonsterKey) {
    Object.assign(this, getMonsterData(key));
  }
}

export const monsterSchema = z.object({
  attackIds: createUniqueArraySchema(attackIdSchema).max(attackIdSchema.options.length),
  id: z.uuidv7(),
  key: monsterKeySchema,
  statistics: statisticsSchema,
  status: statusSchema,
}) satisfies z.ZodType<Monster>;
