import type { Asset } from "@/models/dungeons/Asset";
import { assetSchema } from "@/models/dungeons/Asset";
import type { Attack } from "@/models/dungeons/attack/Attack";
import { attackSchema } from "@/models/dungeons/attack/Attack";
import type { MonsterName } from "@/models/dungeons/monster/MonsterName";
import { monsterNameSchema } from "@/models/dungeons/monster/MonsterName";
import type { Stats } from "@/models/dungeons/monster/Stats";
import { statsSchema } from "@/models/dungeons/monster/Stats";
import { z } from "zod";

export interface Monster {
  id: string;
  monsterName: MonsterName;
  name: string;
  asset: Asset;
  stats: Stats;
  currentLevel: number;
  currentHp: number;
  attackIds: Attack["id"][];
}

export const monsterSchema = z.object({
  id: z.string().uuid(),
  monsterName: monsterNameSchema,
  name: z.string().min(1),
  asset: assetSchema,
  stats: statsSchema,
  currentLevel: z.number().int().positive(),
  currentHp: z.number().int().nonnegative(),
  attackIds: z.array(attackSchema.shape.id),
}) satisfies z.ZodType<Monster>;
