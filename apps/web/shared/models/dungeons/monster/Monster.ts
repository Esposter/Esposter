import type { Asset } from "#shared/models/dungeons/Asset";
import type { AttackId } from "#shared/models/dungeons/attack/AttackId";
import type { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import type { Statistics } from "#shared/models/dungeons/monster/Statistics";
import type { Status } from "#shared/models/dungeons/monster/Status";

import { assetSchema } from "#shared/models/dungeons/Asset";
import { attackIdSchema } from "#shared/models/dungeons/attack/AttackId";
import { monsterKeySchema } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { statisticsSchema } from "#shared/models/dungeons/monster/Statistics";
import { statusSchema } from "#shared/models/dungeons/monster/Status";
import { getMonsterData } from "#shared/services/dungeons/monster/getMonsterData";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export class Monster {
  declare asset: Asset;
  declare attackIds: AttackId[];
  id: string = crypto.randomUUID();
  declare key: MonsterKey;
  declare statistics: Statistics;
  declare status: Status;

  constructor(key: MonsterKey) {
    Object.assign(this, structuredClone(getMonsterData(key)));
  }
}

export const monsterSchema = z.object({
  asset: assetSchema,
  attackIds: createUniqueArraySchema(attackIdSchema),
  id: z.uuid(),
  key: monsterKeySchema,
  statistics: statisticsSchema,
  status: statusSchema,
}) satisfies z.ZodType<Monster>;
