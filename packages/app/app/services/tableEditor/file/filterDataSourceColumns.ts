import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { Row } from "#shared/models/tableEditor/file/Row";
import { takeOne } from "@esposter/shared";

export const filterDataSourceColumns = (dataSource: DataSource, columnIds: string[]): DataSource => {
  const columns = dataSource.columns.filter((column) => columnIds.includes(column.id));
  const rows = dataSource.rows.map((row) => {
    const filteredRow = new Row(structuredClone(row));
    filteredRow.data = Object.fromEntries(columns.map((column) => [column.name, takeOne(row.data, column.name)]));
    return filteredRow;
  });
  return { ...dataSource, columns, rows };
};
