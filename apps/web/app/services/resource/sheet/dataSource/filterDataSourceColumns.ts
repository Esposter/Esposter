import type { Column } from "#shared/models/resource/sheet/column/Column";

import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { compileSheetColumns } from "#shared/services/resource/sheet/column/compileSheetColumns";

export const filterDataSourceColumns = (
  // The compile context, so always every column of the sheet — a computed column resolves its source by id against
  // These and reads null for a source that is missing. Narrowing happens through `columnIds` alone; hand a
  // Display-narrowed list in here and computed cells whose source is hidden go empty
  columns: Column[],
  rows: Row[],
  columnIds: string[],
  // Materializes only the windowed rows, but the columns are bound over every row, so aggregation-transformation
  // Values match what the sheet displays for those rows
  rowRange?: { end: number; start: number },
) => {
  const columnIdSet = new Set(columnIds);
  const filteredColumns = columns.filter((column) => columnIdSet.has(column.id));
  const windowStart = rowRange?.start ?? 0;
  const windowedRows = rowRange ? rows.slice(rowRange.start, rowRange.end + 1) : rows;
  const readCell = compileSheetColumns(columns)(rows);
  // Only the identity is carried over: the cells are read fresh below, so copying the row's data first is wasted work
  const filteredRows = windowedRows.map((row, index) => {
    const rowIndex = windowStart + index;
    return new Row({
      createdAt: row.createdAt,
      data: Object.fromEntries(filteredColumns.map((column) => [column.name, readCell(row, column, rowIndex)])),
      id: row.id,
      updatedAt: row.updatedAt,
    });
  });
  return { columns: filteredColumns, rows: filteredRows };
};
