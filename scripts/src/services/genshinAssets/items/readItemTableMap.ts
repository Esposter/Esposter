import { ITEM_TABLE_NAMES } from "#src/services/genshinAssets/items/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The table each item of the item tables is held in, by its id. An id two tables hold is refused, naming it, since no
// Single table then gives where it is held
export const readItemTableMap = (): Map<number, string> => {
  const itemTableMap = new Map<number, string>();
  for (const tableName of ITEM_TABLE_NAMES) {
    for (const { id } of readExcelTable<{ id: number }>(tableName)) {
      const heldIn = itemTableMap.get(id);
      if (heldIn !== undefined && heldIn !== tableName)
        throw new InvalidOperationError(Operation.Read, String(id), "is in more than one item table");
      itemTableMap.set(id, tableName);
    }
  }
  return itemTableMap;
};
