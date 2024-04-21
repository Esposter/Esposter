import { items } from "@/assets/dungeons/data/items";
import type { ItemId } from "@/models/dungeons/item/ItemId";
import { NotFoundError } from "@/models/error/NotFoundError";

export const getItem = (itemId: ItemId) => {
  const item = items.find((i) => i.id === itemId);
  if (!item) throw new NotFoundError(getItem.name, itemId);
  return item;
};
