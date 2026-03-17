import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { KeepDuplicateMode } from "@/models/tableEditor/file/KeepDuplicateMode";
import type { IndexedRow } from "@/models/tableEditor/file/commands/IndexedRow";

const getRowKey = (row: DataSource["rows"][number]): string =>
  JSON.stringify(Object.fromEntries(Object.entries(row.data).sort(([a], [b]) => a.localeCompare(b))));

export const findDuplicateRows = (
  dataSource: DataSource,
  keepMode = KeepDuplicateMode.First,
): IndexedRow[] => {
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

  const lastIndexByKey = new Map<string, number>();
  for (const [index, row] of dataSource.rows.entries()) lastIndexByKey.set(getRowKey(row), index);
  return dataSource.rows
    .map((row, index) => ({ index, row }))
    .filter(({ index, row }) => lastIndexByKey.get(getRowKey(row)) !== index);
};
