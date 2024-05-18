import type { Chest as IChest } from "@/generated/tiled/propertyTypes/class/Chest";
import { ItemId } from "@/generated/tiled/propertyTypes/enum/ItemId";
import { itemIdSchema } from "@/models/dungeons/item/ItemId";
import { z } from "zod";

export class Chest implements IChest {
  itemId = ItemId.Potion;
  isOpened = false;
}

export const chestSchema = z.object({
  itemId: itemIdSchema,
  isOpened: z.boolean(),
}) satisfies z.ZodType<Chest>;
