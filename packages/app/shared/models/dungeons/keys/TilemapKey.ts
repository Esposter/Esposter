import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { z } from "zod/v4";

export const tilemapKeySchema = z.enum(TilemapKey);
