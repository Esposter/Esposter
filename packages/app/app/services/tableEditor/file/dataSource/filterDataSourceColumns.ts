import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { takeOne, toRawDeep } from "@esposter/shared";

export const filterDataSourceColumns = (dataSource: DataSource, columnIds: string[]): DataSource => {
  const columns = dataSource.columns.filter((column) => columnIds.includes(column.id));
  const rows = dataSource.rows.map((row) => {
    const filteredRow = new Row(structuredClone(toRawDeep(row)));
    filteredRow.data = Object.fromEntries(columns.map((column) => [column.name, takeOne(row.data, column.name)]));
    return filteredRow;
  });
  return { ...dataSource, columns, rows };
};
