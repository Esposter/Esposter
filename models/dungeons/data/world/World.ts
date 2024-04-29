import { Data, dataSchema } from "@/models/dungeons/data/world/Data";
import { TilemapKey, tilemapKeySchema } from "@/models/dungeons/keys/TilemapKey";
import { zodStrictRecord } from "@/util/zod/zodStrictRecord";
import type { z } from "zod";

export const InitialWorld = {
  [TilemapKey.Home]: new Data(),
} satisfies Record<TilemapKey, Data>;
export type World = typeof InitialWorld;

export const worldSchema = zodStrictRecord(tilemapKeySchema, dataSchema) satisfies z.ZodType<World>;
