import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { takeOne } from "@esposter/shared";

// A row's data is keyed in column order, so a command that reorders, restores or renames a column rebuilds every
// Row behind it — and a key no column names any more falls away in the rebuild
export const alignRowDataToColumns = ({ columns, rows }: DataSource) => {
  const columnNames = columns.map(({ name }) => name);
  for (const row of rows) {
    const newData: typeof row.data = {};
    for (const name of columnNames) newData[name] = takeOne(row.data, name);
    row.data = newData;
  }
};
