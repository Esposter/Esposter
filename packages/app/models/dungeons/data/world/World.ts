import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { WorldData, worldDataSchema } from "@/models/dungeons/data/world/WorldData";
import { tilemapKeySchema } from "@/models/dungeons/keys/TilemapKey";
import { zodStrictRecord } from "@/util/validation/zod/zodStrictRecord";
import type { z } from "zod";

const InitialWorld = {
  [TilemapKey.Home]: new WorldData(),
  [TilemapKey.HomeBuilding1]: new WorldData(),
  [TilemapKey.HomeBuilding2]: new WorldData(),
} as const satisfies Record<TilemapKey, WorldData>;
export const getInitialWorld = () => structuredClone(InitialWorld);
export type World = typeof InitialWorld;

export const worldSchema = zodStrictRecord(tilemapKeySchema, worldDataSchema) satisfies z.ZodType<World>;
