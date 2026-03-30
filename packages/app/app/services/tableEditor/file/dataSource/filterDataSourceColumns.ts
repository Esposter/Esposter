import type { Column } from "#shared/models/tableEditor/file/column/Column";

import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { takeOne, toRawDeep } from "@esposter/shared";

export const filterDataSourceColumns = (
  columns: Column[],
  rows: Row[],
  columnIds: string[],
): { columns: Column[]; rows: Row[] } => {
  const filteredColumns = columns.filter((column) => columnIds.includes(column.id));
  const filteredRows = rows.map((row) => {
    const filteredRow = new Row(structuredClone(toRawDeep(row)));
    filteredRow.data = Object.fromEntries(
      filteredColumns.map((column) => [column.name, takeOne(row.data, column.name)]),
    );
    return filteredRow;
  });
  return { columns: filteredColumns, rows: filteredRows };
};
