import type { Chest as IChest } from "@/shared/generated/tiled/propertyTypes/class/Chest";

import { itemIdSchema } from "@/models/dungeons/item/ItemId";
import { ItemId } from "@/shared/generated/tiled/propertyTypes/enum/ItemId";
import { z } from "zod";

export class Chest implements IChest {
  isOpened = false;
  itemId = ItemId.Potion;
}

export const chestSchema = z.object({
  isOpened: z.boolean(),
  itemId: itemIdSchema,
}) satisfies z.ZodType<Chest>;
