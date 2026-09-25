import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { checkIsEditableColumnValue } from "@/services/resource/sheet/column/checkIsEditableColumnValue";
import { takeOne } from "@esposter/shared";

// A row's data is keyed in column order, so a command that reorders, restores, renames or retypes a column rebuilds
// Every row behind it — and a key no stored column names falls away in the rebuild, a computed column's included
export const alignRowDataToColumns = ({ columns, rows }: DataSource) => {
  const columnNames = columns.filter((column) => checkIsEditableColumnValue(column)).map(({ name }) => name);
  for (const row of rows) {
    const newData: typeof row.data = {};
    for (const name of columnNames) newData[name] = takeOne(row.data, name);
    row.data = newData;
  }
};
