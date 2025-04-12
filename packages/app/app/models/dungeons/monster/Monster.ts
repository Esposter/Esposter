import type { Asset } from "@/models/dungeons/Asset";
import type { AttackId } from "@/models/dungeons/attack/AttackId";
import type { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import type { Stats } from "@/models/dungeons/monster/Stats";
import type { Status } from "@/models/dungeons/monster/Status";
import type { Type } from "arktype";

import { assetSchema } from "@/models/dungeons/Asset";
import { attackSchema } from "@/models/dungeons/attack/Attack";
import { monsterKeySchema } from "@/models/dungeons/keys/image/UI/MonsterKey";
import { statsSchema } from "@/models/dungeons/monster/Stats";
import { statusSchema } from "@/models/dungeons/monster/Status";
import { getMonsterData } from "@/services/dungeons/monster/getMonsterData";
import { type } from "arktype";

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

export const monsterSchema = type({
  asset: assetSchema,
  attackIds: attackSchema.get("id").array(),
  id: "string.uuid.v4",
  key: monsterKeySchema,
  stats: statsSchema,
  status: statusSchema,
}) satisfies Type<Monster>;
