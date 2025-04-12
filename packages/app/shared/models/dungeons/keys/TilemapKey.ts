import type { Type } from "arktype";

import { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";
import { type } from "arktype";

export const tilemapKeySchema = type.valueOf(TilemapKey) satisfies Type<TilemapKey>;
