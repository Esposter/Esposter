import { BAG_TAB_BY_TABLE_TYPE } from "#src/services/genshinAssets/items/constants";

// The type a table type is shown under in the bag, a batch-use consumable filed with the consume tab
export const toBagMaterialType = (materialType: string): string => BAG_TAB_BY_TABLE_TYPE[materialType] ?? materialType;
