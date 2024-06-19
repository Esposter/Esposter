import type { Asset } from "@/models/dungeons/Asset";
import { assetSchema } from "@/models/dungeons/Asset";
import { attackSchema } from "@/models/dungeons/attack/Attack";
import type { AttackId } from "@/models/dungeons/attack/AttackId";
import type { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import { monsterKeySchema } from "@/models/dungeons/keys/image/UI/MonsterKey";
import type { Stats } from "@/models/dungeons/monster/Stats";
import { statsSchema } from "@/models/dungeons/monster/Stats";
import type { Status } from "@/models/dungeons/monster/Status";
import { statusSchema } from "@/models/dungeons/monster/Status";
import { getMonsterData } from "@/services/dungeons/monster/getMonsterData";
import { z } from "zod";

export class Monster {
  id: string = crypto.randomUUID();
  key!: MonsterKey;
  asset!: Asset;
  stats!: Stats;
  status!: Status;
  attackIds!: AttackId[];

  constructor(key: MonsterKey) {
    Object.assign(this, structuredClone(getMonsterData(key)));
  }
}

export const monsterSchema = z.object({
  id: z.string().uuid(),
  key: monsterKeySchema,
  asset: assetSchema,
  stats: statsSchema,
  status: statusSchema,
  attackIds: z.array(attackSchema.shape.id),
}) satisfies z.ZodType<Monster>;
