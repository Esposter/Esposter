import type { Asset } from "@/models/dungeons/Asset";
import { assetSchema } from "@/models/dungeons/Asset";
import type { Attack } from "@/models/dungeons/attack/Attack";
import { attackSchema } from "@/models/dungeons/attack/Attack";
import { monsterIdSchema } from "@/models/dungeons/monster/MonsterId";
import type { MonsterId } from "@/models/dungeons/monster/MonsterId";
import type { Stats } from "@/models/dungeons/monster/Stats";
import { statsSchema } from "@/models/dungeons/monster/Stats";
import { z } from "zod";

export interface Monster {
  id: MonsterId;
  name: string;
  asset: Asset;
  stats: Stats;
  currentLevel: number;
  currentHp: number;
  attackIds: Attack["id"][];
}

export const monsterSchema = z.object({
  id: monsterIdSchema,
  name: z.string().min(1),
  asset: assetSchema,
  stats: statsSchema,
  currentLevel: z.number().int().positive(),
  currentHp: z.number().int().nonnegative(),
  attackIds: z.array(attackSchema.shape.id),
}) satisfies z.ZodType<Monster>;
