import type { ChestObjectProperty } from "@/generated/tiled/propertyTypes/class/ChestObjectProperty";
import { ItemId } from "@/generated/tiled/propertyTypes/enum/ItemId";
import { itemIdSchema } from "@/models/dungeons/item/ItemId";
import { z } from "zod";

interface IChest extends Record<Exclude<ChestObjectProperty, ChestObjectProperty.id>, unknown> {}

export class Chest implements IChest {
  itemId = ItemId.Potion;
  isOpened = false;
}

export const chestSchema = z.object({
  itemId: itemIdSchema,
  isOpened: z.boolean(),
}) satisfies z.ZodType<Chest>;
