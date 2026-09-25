import type { ItemId } from "#shared/generated/tiled/propertyTypes/enum/ItemId";

import { items } from "#shared/assets/dungeons/data/items";
import { getById } from "#shared/services/dungeons/getById";

export const getItem = (itemId: ItemId) => getById(items, itemId, getItem.name);
