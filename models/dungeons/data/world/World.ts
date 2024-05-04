import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { WorldData, worldDataSchema } from "@/models/dungeons/data/world/WorldData";
import { tilemapKeySchema } from "@/models/dungeons/keys/TilemapKey";
import { zodStrictRecord } from "@/util/zod/zodStrictRecord";
import type { z } from "zod";

export const InitialWorld = {
  [TilemapKey.Home]: new WorldData(),
} as const satisfies Record<TilemapKey, WorldData>;
export type World = typeof InitialWorld;

export const worldSchema = zodStrictRecord(tilemapKeySchema, worldDataSchema) satisfies z.ZodType<World>;
