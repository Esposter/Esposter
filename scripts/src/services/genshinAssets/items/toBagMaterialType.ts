import { TABLE_TYPE_BAG_TAB_MAP } from "#src/services/genshinAssets/items/constants";

// The type a table type is shown under in the bag, a batch-use consumable filed with the consume tab
export const toBagMaterialType = (materialType: string): string => TABLE_TYPE_BAG_TAB_MAP[materialType] ?? materialType;
