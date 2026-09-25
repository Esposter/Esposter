import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";

import { coerceValue } from "@/services/resource/sheet/column/coerceValue";
import { inferColumnType } from "@/services/resource/sheet/column/inferColumnType";
import { takeOne } from "@esposter/shared";

// A row keys each cell by its column's name, so a file with two headers spelling one name — or a blank header whose
// `Column N` fallback matches a real one — would file both columns' cells under the one key and lose the first
// Column's values. Every importer reads its headers through here, so a repeat takes the first numbered suffix no
// Header already has, and the column form's own uniqueness rule then holds for imported sheets too
const getUniqueColumnNames = (sourceNames: string[]) => {
  const takenNames = new Set(sourceNames);
  const seenNames = new Set<string>();
  return sourceNames.map((sourceName) => {
    if (!seenNames.has(sourceName)) {
      seenNames.add(sourceName);
      return sourceName;
    }

    let suffix = 2;
    while (takenNames.has(`${sourceName} (${suffix})`)) suffix++;
    const uniqueName = `${sourceName} (${suffix})`;
    takenNames.add(uniqueName);
    return uniqueName;
  });
};

export const buildDataset = (sourceNames: string[], bodyRows: string[][]): Dataset => {
  const columns: DatasetColumn[] = getUniqueColumnNames(sourceNames).map((name, index) => ({
    name,
    type: inferColumnType(bodyRows.map((row) => takeOne(row, index))),
  }));
  const rows = bodyRows.map((bodyRow) =>
    Object.fromEntries(
      columns.map((column, index) => [column.name, coerceValue(takeOne(bodyRow, index), column.type)]),
    ),
  );
  return { columns, rows };
};
