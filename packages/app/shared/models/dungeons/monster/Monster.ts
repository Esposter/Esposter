import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { Asset } from "#shared/models/dungeons/Asset";
import type { AttackId } from "#shared/models/dungeons/attack/AttackId";
import type { Stats } from "#shared/models/dungeons/monster/Stats";
import type { Status } from "#shared/models/dungeons/monster/Status";

import { assetSchema } from "#shared/models/dungeons/Asset";
import { attackSchema } from "#shared/models/dungeons/attack/Attack";
import { fileKeySchema } from "#shared/models/dungeons/keys/FileKey";
import { statsSchema } from "#shared/models/dungeons/monster/Stats";
import { statusSchema } from "#shared/models/dungeons/monster/Status";
import { getMonsterData } from "#shared/services/dungeons/monster/getMonsterData";
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
  attackIds: attackSchema.shape.id.array(),
  id: z.uuid(),
  key: fileKeySchema,
  stats: statsSchema,
  status: statusSchema,
}) satisfies z.ZodType<Monster>;
