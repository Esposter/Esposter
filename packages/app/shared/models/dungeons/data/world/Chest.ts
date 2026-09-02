import type { Chest as BaseChest } from "#shared/generated/tiled/propertyTypes/class/Chest";

import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import { itemIdSchema } from "#shared/models/dungeons/item/ItemId";
import { z } from "zod";

export class Chest implements BaseChest {
  isOpened = false;
  itemId = ItemId.Potion;
}

export const chestSchema = z.object({
  isOpened: z.boolean(),
  itemId: itemIdSchema,
}) satisfies z.ZodType<Chest>;
