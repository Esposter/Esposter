import type { Chest as IChest } from "#shared/generated/tiled/propertyTypes/class/Chest";
import type { Type } from "arktype";

import { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";
import { itemIdSchema } from "@/models/dungeons/item/ItemId";
import { type } from "arktype";

export class Chest implements IChest {
  isOpened = false;
  itemId = ItemId.Potion;
}

export const chestSchema = type({
  isOpened: "boolean",
  itemId: itemIdSchema,
}) satisfies Type<Chest>;
