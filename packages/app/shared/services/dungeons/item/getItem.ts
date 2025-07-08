import type { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";

import { items } from "@/assets/dungeons/data/items";
import { NotFoundError } from "@esposter/shared";

export const getItem = (itemId: ItemId) => {
  const item = items.find(({ id }) => id === itemId);
  if (!item) throw new NotFoundError(getItem.name, itemId);
  return item;
};
