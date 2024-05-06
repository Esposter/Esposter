import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import type { Chest } from "@/models/dungeons/data/world/Chest";
import { chestSchema } from "@/models/dungeons/data/world/Chest";
import { tilemapKeySchema } from "@/models/dungeons/keys/TilemapKey";
import { z } from "zod";

export class WorldData {
  tilemapKey = TilemapKey.Home;
  chestMap = new Map<string, Chest>();
}

export const worldDataSchema = z.object({
  tilemapKey: tilemapKeySchema,
  chestMap: z.map(z.string().min(1), chestSchema),
}) satisfies z.ZodType<WorldData>;
