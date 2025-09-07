import type { Asset } from "#shared/models/dungeons/Asset";
import type { AttackId } from "#shared/models/dungeons/attack/AttackId";
import type { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import type { Stats } from "#shared/models/dungeons/monster/Stats";
import type { Status } from "#shared/models/dungeons/monster/Status";

import { assetSchema } from "#shared/models/dungeons/Asset";
import { attackSchema } from "#shared/models/dungeons/attack/Attack";
import { monsterKeySchema } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { statsSchema } from "#shared/models/dungeons/monster/Stats";
import { statusSchema } from "#shared/models/dungeons/monster/Status";
import { getMonsterData } from "#shared/services/dungeons/monster/getMonsterData";
import { z } from "zod";

export class Monster {
  asset!: Asset;
  attackIds!: AttackId[];
  id: string = crypto.randomUUID();
  key!: MonsterKey;
  stats!: Stats;
  status!: Status;

  constructor(key: MonsterKey) {
    Object.assign(this, structuredClone(getMonsterData(key)));
  }
}

export const monsterSchema = z.object({
  asset: assetSchema,
  attackIds: attackSchema.shape.id.array(),
  id: z.uuid(),
  key: monsterKeySchema,
  stats: statsSchema,
  status: statusSchema,
}) satisfies z.ZodType<Monster>;
