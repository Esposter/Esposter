import type { Chest } from "#shared/models/dungeons/data/world/Chest";

import { chestSchema } from "#shared/models/dungeons/data/world/Chest";
import { z } from "zod";

export class WorldData {
  chestMap: Record<string, Chest> = {};
}

export const worldDataSchema = z.object({
  chestMap: z.record(z.string().min(1), chestSchema),
}) as const satisfies z.ZodType<WorldData>;
