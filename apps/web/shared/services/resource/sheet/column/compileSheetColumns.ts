import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnCellReader } from "#shared/models/resource/sheet/column/ColumnCellReader";
import type { SheetCellReader } from "#shared/models/resource/sheet/column/SheetCellReader";
import type { ColumnTransformation } from "#shared/models/resource/sheet/column/transformation/ColumnTransformation";
import type { ColumnTransformationCompiler } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationCompiler";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { getCyclicColumnIds } from "#shared/services/resource/sheet/column/getCyclicColumnIds";
import { ColumnTransformationCompileMap } from "#shared/services/resource/sheet/column/transformation/ColumnTransformationCompileMap";
import { ColumnTransformationSourceIdsMap } from "#shared/services/resource/sheet/column/transformation/ColumnTransformationSourceIdsMap";
import { getOrCreate, takeOne } from "@esposter/shared";

// Compiles a sheet's computed columns once and binds them to a row list once, so a cell read is a lookup.
// A cyclic column reads empty rather than recursing, so the cycles are found up front, not guarded per read
export const compileSheetColumns = (columns: ToData<Column>[]) => {
  const columnIdMap = new Map(columns.map((column) => [column.id, column]));
  const findSource = (sourceColumnId: string) => columnIdMap.get(sourceColumnId);
  const compiledMap = new Map<string, ReturnType<ColumnTransformationCompiler<ColumnTransformation>>>();
  const sourceIdsMap = new Map<string, string[]>();
  for (const column of columns) {
    if (column.type !== ColumnType.Computed) continue;
    const { transformation } = column;
    compiledMap.set(
      column.id,
      ColumnTransformationCompileMap[transformation.type](transformation as never, findSource),
    );
    sourceIdsMap.set(column.id, ColumnTransformationSourceIdsMap[transformation.type](transformation as never));
  }
  const cyclicColumnIds = getCyclicColumnIds(sourceIdsMap);

  return (rows: ToData<Row>[]): SheetCellReader => {
    const readerMap = new Map<string, ColumnCellReader>();
    const readerOf = (column: ToData<Column>) => getOrCreate(readerMap, column.id, () => bindColumn(column));
    const readSource = (sourceColumnId: string): ColumnCellReader => {
      const sourceColumn = columnIdMap.get(sourceColumnId);
      if (sourceColumn) return readerOf(sourceColumn);
      else return () => null;
    };
    const bindColumn = (column: ToData<Column>): ColumnCellReader => {
      if (column.type !== ColumnType.Computed) return (row) => takeOne(row.data, column.name);
      const bindTransformation = compiledMap.get(column.id);
      if (!bindTransformation || cyclicColumnIds.has(column.id)) return () => null;
      return bindTransformation({ readSource, rows });
    };
    // Bound up front rather than on first read, since a read can happen outside the caller's reactive tracking.
    // Only a bind here records an aggregation's source cells as what the caller depends on
    for (const column of columns) readerOf(column);
    return (row, column, rowIndex) => readerOf(column)(row, rowIndex);
  };
};
