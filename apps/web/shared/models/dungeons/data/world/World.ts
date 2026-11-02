import type { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import type { WorldData } from "#shared/models/dungeons/data/world/WorldData";

import { worldDataSchema } from "#shared/models/dungeons/data/world/WorldData";
import { tilemapKeySchema } from "#shared/models/dungeons/keys/TilemapKey";
import { z } from "zod";

export type World = Record<TilemapKey, WorldData>;

// Keyed by an enumeration, so every tilemap is present and the record takes no entry cap of its own
export const worldSchema = z.record(tilemapKeySchema, worldDataSchema) satisfies z.ZodType<World>;
