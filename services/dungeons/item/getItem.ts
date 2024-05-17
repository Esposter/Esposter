import { items } from "@/assets/dungeons/data/items";
import type { ItemId } from "@/generated/tiled/propertyTypes/enum/ItemId";
import { NotFoundError } from "esposter-shared";

export const getItem = (itemId: ItemId) => {
  const item = items.find((i) => i.id === itemId);
  if (!item) throw new NotFoundError(getItem.name, itemId);
  return item;
};
