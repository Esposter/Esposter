import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { WorldData, worldDataSchema } from "@/models/dungeons/data/world/WorldData";
import { tilemapKeySchema } from "@/models/dungeons/keys/TilemapKey";
import { zodStrictRecord } from "@/util/validation/zod/zodStrictRecord";
import type { z } from "zod";

export const getInitialWorld = () =>
  Object.values(TilemapKey).reduce((acc, curr) => {
    acc[curr] = new WorldData();
    return acc;
  }, {} as World);
export type World = Record<TilemapKey, WorldData>;

export const worldSchema = zodStrictRecord(tilemapKeySchema, worldDataSchema) satisfies z.ZodType<World>;
