import type { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import type { Asset } from "@/models/dungeons/Asset";
import type { AttackId } from "@/models/dungeons/attack/AttackId";
import type { Stats } from "@/models/dungeons/monster/Stats";
import type { Status } from "@/models/dungeons/monster/Status";

import { monsterKeySchema } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { assetSchema } from "@/models/dungeons/Asset";
import { attackSchema } from "@/models/dungeons/attack/Attack";
import { statsSchema } from "@/models/dungeons/monster/Stats";
import { statusSchema } from "@/models/dungeons/monster/Status";
import { getMonsterData } from "@/services/dungeons/monster/getMonsterData";
import { z } from "zod/v4";

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
