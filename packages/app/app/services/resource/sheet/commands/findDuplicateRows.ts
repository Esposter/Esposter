import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { IndexedRow } from "@/models/resource/sheet/commands/IndexedRow";

import { KeepDuplicateMode } from "@/models/resource/sheet/commands/KeepDuplicateMode";
import { takeOne } from "@esposter/shared";

export const findDuplicateRows = (dataSource: DataSource, keepMode = KeepDuplicateMode.First): IndexedRow[] => {
  const sortedKeys = dataSource.columns.map(({ name }) => name).toSorted((a, b) => a.localeCompare(b));
  const getRowKey = (row: Row): string => JSON.stringify(sortedKeys.map((key) => row.data[key]));

  if (keepMode === KeepDuplicateMode.First) {
    const seen = new Set<string>();
    const duplicates: IndexedRow[] = [];
    for (const [index, row] of dataSource.rows.entries()) {
      const key = getRowKey(row);
      if (seen.has(key)) duplicates.push({ index, row });
      else seen.add(key);
    }
    return duplicates;
  }

  const keys: string[] = [];
  const lastIndexByKey = new Map<string, number>();
  for (const [index, row] of dataSource.rows.entries()) {
    const key = getRowKey(row);
    keys.push(key);
    lastIndexByKey.set(key, index);
  }

  const duplicates: IndexedRow[] = [];
  for (const [index, row] of dataSource.rows.entries())
    if (lastIndexByKey.get(takeOne(keys, index)) !== index) duplicates.push({ index, row });
  return duplicates;
};
