import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DatasetColumn } from "#shared/models/dataset/DatasetColumn";

import { coerceValue } from "@/services/resource/sheet/column/coerceValue";
import { inferColumnType } from "@/services/resource/sheet/column/inferColumnType";
import { takeOne } from "@esposter/shared";

export const buildDataset = (sourceNames: string[], bodyRows: string[][]): Dataset => {
  const columns: DatasetColumn[] = sourceNames.map((name, index) => ({
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
