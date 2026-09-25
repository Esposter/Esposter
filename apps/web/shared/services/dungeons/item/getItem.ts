import type { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";

import { items } from "#shared/assets/dungeons/data/items";
import { NotFoundError } from "@esposter/shared";

// A copy rather than the definition itself: every caller goes on to give the item a quantity it then spends, and
// Writing that onto the definition would hand the same count to every inventory built from it afterwards
export const getItem = (itemId: ItemId) => {
  const item = items.find(({ id }) => id === itemId);
  if (item) return structuredClone(item);
  else throw new NotFoundError(getItem.name, itemId);
};
