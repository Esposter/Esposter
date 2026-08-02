import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { filterDataSourceColumns } from "@/services/resource/sheet/dataSource/filterDataSourceColumns";

// A cell range indexes the displayed columns, while computeValue must still resolve a computed column's
// Source against every column — a source column the user hid is absent from the displayed set, and
// ComputeValue answers null for a source it cannot find. Both sets are derived here from the one
// DataSource, so the narrowed set can never be handed in as the compute context
export const filterDataSourceRange = (
  dataSource: DataSource,
  rows: Row[],
  range: { columnEnd: number; columnStart: number; rowEnd: number; rowStart: number },
): { columns: Column[]; rows: Row[] } => {
  const columnIds = dataSource.columns
    .filter((column) => !column.hidden)
    .slice(range.columnStart, range.columnEnd + 1)
    .map(({ id }) => id);
  return filterDataSourceColumns(dataSource.columns, rows, columnIds, {
    end: range.rowEnd,
    start: range.rowStart,
  });
};
