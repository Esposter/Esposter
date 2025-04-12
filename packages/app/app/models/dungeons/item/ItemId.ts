import type { Type } from "arktype";

import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import { type } from "arktype";

export const itemIdSchema = type.valueOf(ItemId) satisfies Type<ItemId>;
