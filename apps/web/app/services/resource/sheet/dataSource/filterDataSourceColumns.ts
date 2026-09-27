import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { AggregationTransformation } from "#shared/models/resource/sheet/column/transformation/AggregationTransformation";
import type { AggregationTransformationReader } from "#shared/models/resource/sheet/column/transformation/AggregationTransformationReader";

import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { computeValue } from "#shared/services/resource/sheet/column/computeValue";
import { toRawDeep } from "@esposter/shared";

export const filterDataSourceColumns = (
  // The compute context, so always every column of the sheet — computeValue resolves a computed column's
  // Source by id against these and answers null for a source that is missing. Narrowing happens through
  // `columnIds` alone; hand a display-narrowed list in here and computed cells whose source is hidden go empty
  columns: Column[],
  rows: Row[],
  columnIds: string[],
  // Materializes only the windowed rows while computeValue still sees the full rows, so
  // Aggregation-transformation values match what the sheet displays for those rows
  rowRange?: { end: number; start: number },
) => {
  const columnIdSet = new Set(columnIds);
  const filteredColumns = columns.filter((column) => columnIdSet.has(column.id));
  const windowStart = rowRange?.start ?? 0;
  const windowedRows = rowRange ? rows.slice(rowRange.start, rowRange.end + 1) : rows;
  const transformationReaderMap = new Map<AggregationTransformation, AggregationTransformationReader>();
  const filteredRows = windowedRows.map((row, index) => {
    const rowIndex = windowStart + index;
    const filteredRow = new Row(structuredClone(toRawDeep(row)));
    filteredRow.data = Object.fromEntries(
      filteredColumns.map((column) => [
        column.name,
        computeValue(rows, row, columns, column, rowIndex, transformationReaderMap),
      ]),
    );
    return filteredRow;
  });
  return { columns: filteredColumns, rows: filteredRows };
};
