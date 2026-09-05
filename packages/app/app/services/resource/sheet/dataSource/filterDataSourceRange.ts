import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { getVisibleColumns } from "@/services/resource/sheet/column/getVisibleColumns";
import { filterDataSourceColumns } from "@/services/resource/sheet/dataSource/filterDataSourceColumns";

// The range indexes the displayed columns while the compute context stays every column of the sheet, and both
// Sets are derived here from the one `DataSource` — so the narrowed set can never be handed in as the context
export const filterDataSourceRange = (
  dataSource: DataSource,
  rows: Row[],
  range: { columnEnd: number; columnStart: number; rowEnd: number; rowStart: number },
): { columns: Column[]; rows: Row[] } => {
  const columnIds = getVisibleColumns(dataSource.columns)
    .slice(range.columnStart, range.columnEnd + 1)
    .map(({ id }) => id);
  return filterDataSourceColumns(dataSource.columns, rows, columnIds, {
    end: range.rowEnd,
    start: range.rowStart,
  });
};
