import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { IndexedRow } from "@/models/resource/sheet/commands/IndexedRow";

import { KeepDuplicateMode } from "@/models/resource/sheet/commands/KeepDuplicateMode";
import { takeOne } from "@esposter/shared";

export const findDuplicateRows = (dataSource: DataSource, keepMode = KeepDuplicateMode.First): IndexedRow[] => {
  const sortedKeys = dataSource.columns
    .map(({ name }) => name)
    .toSorted((firstKey, secondKey) => firstKey.localeCompare(secondKey));
  const getRowKey = (row: Row): string => JSON.stringify(sortedKeys.map((key) => row.data[key]));

  const duplicateRows: IndexedRow[] = [];
  // First mode keeps the earliest of each key, so a row is a duplicate the moment its key has been seen. Last
  // Mode keeps the latest, which no single forward pass can know — the whole column has to be indexed first
  if (keepMode === KeepDuplicateMode.First) {
    const seenKeys = new Set<string>();
    for (const [index, row] of dataSource.rows.entries()) {
      const key = getRowKey(row);
      if (seenKeys.has(key)) duplicateRows.push({ index, row });
      else seenKeys.add(key);
    }
  } else {
    const keys: string[] = [];
    const keyLastIndexMap = new Map<string, number>();
    for (const [index, row] of dataSource.rows.entries()) {
      const key = getRowKey(row);
      keys.push(key);
      keyLastIndexMap.set(key, index);
    }

    for (const [index, row] of dataSource.rows.entries())
      if (keyLastIndexMap.get(takeOne(keys, index)) !== index) duplicateRows.push({ index, row });
  }
  return duplicateRows;
};
