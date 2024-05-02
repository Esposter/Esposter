import { WorldData, worldDataSchema } from "@/models/dungeons/data/world/WorldData";
import { TilemapKey, tilemapKeySchema } from "@/models/dungeons/keys/TilemapKey";
import { zodStrictRecord } from "@/util/zod/zodStrictRecord";
import type { z } from "zod";

export const InitialWorld = {
  [TilemapKey.Home]: new WorldData(),
} satisfies Record<TilemapKey, WorldData>;
export type World = typeof InitialWorld;

export const worldSchema = zodStrictRecord(tilemapKeySchema, worldDataSchema) satisfies z.ZodType<World>;
