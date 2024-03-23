import type { Asset } from "@/models/dungeons/Asset";
import { assetSchema } from "@/models/dungeons/Asset";
import { attackSchema } from "@/models/dungeons/attack/Attack";
import type { Attack } from "@/models/dungeons/attack/Attack";
import { statsSchema } from "@/models/dungeons/battle/monster/Stats";
import type { Stats } from "@/models/dungeons/battle/monster/Stats";
import { z } from "zod";

export interface Monster {
  name: string;
  asset: Asset;
  stats: Stats;
  currentLevel: number;
  currentHp: number;
  attackIds: Attack["id"][];
}

export const monsterSchema = z.object({
  name: z.string().min(1),
  asset: assetSchema,
  stats: statsSchema,
  currentLevel: z.number().int().positive(),
  currentHp: z.number().int().nonnegative(),
  attackIds: z.array(attackSchema.shape.id),
}) satisfies z.ZodType<Monster>;
