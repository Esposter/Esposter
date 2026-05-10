import type { Column } from "#shared/models/tableEditor/file/column/Column";

import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { computeValue } from "@/services/tableEditor/file/column/computeValue";
import { toRawDeep } from "@esposter/shared";

export const filterDataSourceColumns = (
  columns: Column[],
  rows: Row[],
  columnIds: string[],
): { columns: Column[]; rows: Row[] } => {
  const columnIdSet = new Set(columnIds);
  const filteredColumns = columns.filter((column) => columnIdSet.has(column.id));
  const filteredRows = rows.map((row, rowIndex) => {
    const filteredRow = new Row(structuredClone(toRawDeep(row)));
    filteredRow.data = Object.fromEntries(
      filteredColumns.map((column) => [column.name, computeValue(rows, row, columns, column, rowIndex) ?? null]),
    );
    return filteredRow;
  });
  return { columns: filteredColumns, rows: filteredRows };
};
