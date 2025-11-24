import type { z } from "zod";

import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { WorldData, worldDataSchema } from "#shared/models/dungeons/data/world/WorldData";
import { tilemapKeySchema } from "#shared/models/dungeons/keys/TilemapKey";
import { zodStrictRecord } from "#shared/services/zod/zodStrictRecord";

export type World = Record<TilemapKey, WorldData>;
export const getInitialWorld = (): World =>
  Object.fromEntries(Object.values(TilemapKey).map((k) => [k, new WorldData()]));

export const worldSchema = zodStrictRecord(tilemapKeySchema, worldDataSchema) satisfies z.ZodType<World>;
