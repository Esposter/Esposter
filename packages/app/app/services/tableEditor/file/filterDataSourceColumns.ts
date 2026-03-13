import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { Row } from "#shared/models/tableEditor/file/Row";

export const filterDataSourceColumns = (dataSource: DataSource, columnIds: string[]): DataSource => {
  const columns = dataSource.columns.filter((column) => columnIds.includes(column.id));
  const rows = dataSource.rows.map((row) => {
    const filteredRow = new Row({ ...row });
    filteredRow.data = Object.fromEntries(columns.map((column) => [column.name, row.data[column.name] ?? null]));
    return filteredRow;
  });
  return { ...dataSource, columns, rows };
};
