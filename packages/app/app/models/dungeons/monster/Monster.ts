import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { Asset } from "@/models/dungeons/Asset";
import type { AttackId } from "@/models/dungeons/attack/AttackId";
import type { Stats } from "@/models/dungeons/monster/Stats";
import type { Status } from "@/models/dungeons/monster/Status";

import { assetSchema } from "@/models/dungeons/Asset";
import { attackSchema } from "@/models/dungeons/attack/Attack";
import { fileKeySchema } from "@/models/dungeons/keys/FileKey";
import { statsSchema } from "@/models/dungeons/monster/Stats";
import { statusSchema } from "@/models/dungeons/monster/Status";
import { getMonsterData } from "@/services/dungeons/monster/getMonsterData";
import { z } from "zod";

export class Monster {
  asset!: Asset;
  attackIds!: AttackId[];
  id: string = crypto.randomUUID();
  key!: FileKey;
  stats!: Stats;
  status!: Status;

  constructor(key: FileKey) {
    Object.assign(this, structuredClone(getMonsterData(key)));
  }
}

export const monsterSchema = z.object({
  asset: assetSchema,
  attackIds: z.array(attackSchema.shape.id),
  id: z.string().uuid(),
  key: fileKeySchema,
  stats: statsSchema,
  status: statusSchema,
}) satisfies z.ZodType<Monster>;
