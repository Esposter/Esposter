import { ITEM_TABLE_NAMES, MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/items/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The table each item of the item tables is held in, by its id. The material table's rows are given, since the builder
// Has read them already. An id two tables hold is refused, naming it, since no single table then gives where it is held
export const readItemTableMap = (materialRows: { id: number }[]): Map<number, string> => {
  const itemTableMap = new Map<number, string>();
  for (const tableName of ITEM_TABLE_NAMES) {
    const rows = tableName === MATERIAL_TABLE_NAME ? materialRows : readExcelTable<{ id: number }>(tableName);
    for (const { id } of rows) {
      const heldIn = itemTableMap.get(id);
      if (heldIn !== undefined && heldIn !== tableName)
        throw new InvalidOperationError(Operation.Read, String(id), "is in more than one item table");
      itemTableMap.set(id, tableName);
    }
  }
  return itemTableMap;
};
