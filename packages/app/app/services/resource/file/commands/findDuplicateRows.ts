import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";
import type { Row } from "#shared/models/resource/file/datasource/Row";
import type { IndexedRow } from "@/models/resource/file/commands/IndexedRow";

import { KeepDuplicateMode } from "@/models/resource/file/commands/KeepDuplicateMode";

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

  const entries = dataSource.rows.map((row, index) => ({ index, key: getRowKey(row), row }));
  const lastIndexByKey = new Map(entries.map(({ index, key }) => [key, index]));
  return entries
    .filter(({ index, key }) => lastIndexByKey.get(key) !== index)
    .map(({ index, row }) => ({ index, row }));
};
