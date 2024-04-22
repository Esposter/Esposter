import type { Asset } from "@/models/dungeons/Asset";
import { assetSchema } from "@/models/dungeons/Asset";
import { attackSchema } from "@/models/dungeons/attack/Attack";
import type { AttackId } from "@/models/dungeons/attack/AttackId";
import type { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import { monsterKeySchema } from "@/models/dungeons/keys/image/UI/MonsterKey";
import type { Stats } from "@/models/dungeons/monster/Stats";
import { statsSchema } from "@/models/dungeons/monster/Stats";
import { getMonsterDetails } from "@/services/dungeons/monster/getMonsterDetails";
import { z } from "zod";

export class Monster {
  id: string = crypto.randomUUID();
  key!: MonsterKey;
  asset!: Asset;
  stats!: Stats;
  currentLevel!: number;
  currentHp!: number;
  attackIds!: AttackId[];

  constructor(key: MonsterKey) {
    Object.assign(this, getMonsterDetails(key));
  }
}

export const monsterSchema = z.object({
  id: z.string().uuid(),
  key: monsterKeySchema,
  asset: assetSchema,
  stats: statsSchema,
  currentLevel: z.number().int().positive(),
  currentHp: z.number().int().nonnegative(),
  attackIds: z.array(attackSchema.shape.id),
}) satisfies z.ZodType<Monster>;
