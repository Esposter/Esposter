import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import { z } from "zod";

export const itemIdSchema = z.enum(ItemId) satisfies z.ZodType<ItemId>;
