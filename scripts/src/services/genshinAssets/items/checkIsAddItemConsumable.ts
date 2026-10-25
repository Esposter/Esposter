import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import { ADD_ITEM_USE_OP, BAG_MATERIAL_TYPES } from "#src/services/genshinAssets/items/constants";
import { toBagMaterialType } from "#src/services/genshinAssets/items/toBagMaterialType";

// A consumable whose use adds an item to the bag, where the bag has a tab for its type
export const checkIsAddItemConsumable = ({ itemUse, materialType }: MaterialRow): boolean =>
  materialType !== undefined &&
  itemUse.some(({ useOp }) => useOp === ADD_ITEM_USE_OP) &&
  BAG_MATERIAL_TYPES.includes(toBagMaterialType(materialType));
