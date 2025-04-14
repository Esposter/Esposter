import type { Asset } from "@/models/dungeons/Asset";
import type { AttackId } from "@/models/dungeons/attack/AttackId";
import type { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import type { Stats } from "@/models/dungeons/monster/Stats";
import type { Status } from "@/models/dungeons/monster/Status";

import { assetSchema } from "@/models/dungeons/Asset";
import { attackSchema } from "@/models/dungeons/attack/Attack";
import { monsterKeySchema } from "@/models/dungeons/keys/image/UI/MonsterKey";
import { statsSchema } from "@/models/dungeons/monster/Stats";
import { statusSchema } from "@/models/dungeons/monster/Status";
import { getMonsterData } from "@/services/dungeons/monster/getMonsterData";
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
  attackIds: z.array(attackSchema.shape.id),
  id: z.uuid(),
  key: monsterKeySchema,
  stats: statsSchema,
  status: statusSchema,
}) satisfies z.ZodType<Monster>;
