import { TilemapKey } from "@/generated/tiled/propertyTypes/enum/TilemapKey";
import { z } from "zod";

export const tilemapKeySchema = z.nativeEnum(TilemapKey);
