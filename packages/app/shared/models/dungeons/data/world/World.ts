import type { z } from "zod";

import { TilemapKey } from "@/shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { WorldData, worldDataSchema } from "@/shared/models/dungeons/data/world/WorldData";
import { tilemapKeySchema } from "@/shared/models/dungeons/keys/TilemapKey";
import { zodStrictRecord } from "@/util/validation/zod/zodStrictRecord";

export const getInitialWorld = () =>
  Object.values(TilemapKey).reduce((acc, curr) => {
    acc[curr] = new WorldData();
    return acc;
  }, {} as World);
export type World = Record<TilemapKey, WorldData>;

export const worldSchema = zodStrictRecord(tilemapKeySchema, worldDataSchema) satisfies z.ZodType<World>;
