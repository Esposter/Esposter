import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import { z } from "zod/v4";

export const itemIdSchema = z.enum(ItemId) satisfies z.ZodType<ItemId>;
