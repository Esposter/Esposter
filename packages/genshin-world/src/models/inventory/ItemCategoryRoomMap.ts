import { ItemCategory } from "genshin-interface/save";
import { z } from "zod";

// The tabs the bag counts on their own, and how many pieces each holds, published as the stats dataset's `itemRooms`.
// A tab the game does not count on its own has no room here, and the rest share the bag's kind limit
export interface ItemCategoryRoomMap extends Partial<Record<ItemCategory, number>> {}

export const itemCategoryRoomMapSchema = z.partialRecord(
  z.enum(ItemCategory),
  z.int().positive(),
) satisfies z.ZodType<ItemCategoryRoomMap>;
