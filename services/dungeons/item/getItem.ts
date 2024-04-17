import { items } from "@/assets/dungeons/data/items";
import type { ItemId } from "@/models/dungeons/item/ItemId";
import { DataType } from "@/models/error/dungeons/DataType";
import { NotFoundError } from "@/models/error/NotFoundError";

export const getItem = (itemId: ItemId) => {
  const item = items.find((i) => i.id === itemId);
  if (!item) throw new NotFoundError(DataType.Item, itemId);
  return item;
};
