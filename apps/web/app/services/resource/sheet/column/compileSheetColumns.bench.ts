import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { SheetCellReader } from "#shared/models/resource/sheet/column/SheetCellReader";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";
import { createComputedColumn } from "#shared/models/resource/sheet/column/createComputedColumn.test";
import { createNumberColumn } from "#shared/models/resource/sheet/column/createNumberColumn.test";
import { AggregationTransformationType } from "#shared/models/resource/sheet/column/transformation/AggregationTransformationType";
import { ColumnTransformationType } from "#shared/models/resource/sheet/column/transformation/ColumnTransformationType";
import { compileSheetColumns } from "#shared/services/resource/sheet/column/compileSheetColumns";
import { generateBenchRows } from "@/composables/resource/sheet/commands/generateBenchRows.bench";
import { compareColumnValues } from "@/services/resource/sheet/column/compareColumnValues";
import { BENCHMARK_RUN_OPTIONS } from "@esposter/shared-node/bench";
import { describe, test } from "vitest";

const aColumn = createNumberColumn("a");
const bColumn = createNumberColumn("b");
const cColumn = createNumberColumn("c");
const dColumn = createNumberColumn("d");
const eColumn = createNumberColumn("e");
const storedColumns = [aColumn, bColumn, cColumn, dColumn, eColumn];
const mathColumn = new ComputedColumn({
  name: "math",
  size: 0,
  sourceName: "math",
  transformation: {
    expression: "a * (1 - b) + c / 2",
    type: ColumnTransformationType.Math,
    variables: [
      { name: "a", sourceColumnId: aColumn.id },
      { name: "b", sourceColumnId: bColumn.id },
      { name: "c", sourceColumnId: cColumn.id },
    ],
  },
});
const textColumn = createComputedColumn("text", aColumn.id);
const digitColumn = new ComputedColumn({
  name: "digit",
  size: 0,
  sourceName: "digit",
  transformation: {
    groupIndex: 1,
    pattern: "(\\d)",
    sourceColumnId: textColumn.id,
    type: ColumnTransformationType.RegexMatch,
  },
});
const rankColumn = new ComputedColumn({
  name: "rank",
  size: 0,
  sourceName: "rank",
  transformation: {
    aggregationTransformationType: AggregationTransformationType.Rank,
    sourceColumnId: dColumn.id,
    type: ColumnTransformationType.Aggregation,
  },
});
const nextColumn = new ComputedColumn({
  name: "next",
  size: 0,
  sourceName: "next",
  transformation: {
    expression: "r + 1",
    type: ColumnTransformationType.Math,
    variables: [{ name: "r", sourceColumnId: rankColumn.id }],
  },
});
const columns: Column[] = [...storedColumns, mathColumn, textColumn, digitColumn, rankColumn, nextColumn];

const rows100 = generateBenchRows(100);
const rows1k = generateBenchRows(1000);
const rows10k = generateBenchRows(10000);
const rowIdIndexMap100 = new Map(rows100.map((row, index) => [row.id, index]));
const rowIdIndexMap1k = new Map(rows1k.map((row, index) => [row.id, index]));

// One pass compiles the sheet, binds it to the rows and reads each listed column's cell for every row
const readPass = (rows: Row[], readColumns: Column[]) => {
  const readCell = compileSheetColumns(columns)(rows);
  for (const [rowIndex, row] of rows.entries()) for (const column of readColumns) readCell(row, column, rowIndex);
};
// The grid binds once for its rows and sorts through that binding, so only the comparisons are timed
const sortRows = (rows: Row[], rowIdIndexMap: Map<string, number>, readCell: SheetCellReader, column: Column) =>
  rows.toSorted((firstRow, secondRow) =>
    compareColumnValues(
      readCell(firstRow, column, rowIdIndexMap.get(firstRow.id)),
      readCell(secondRow, column, rowIdIndexMap.get(secondRow.id)),
    ),
  );

describe("compileSheetColumns", () => {
  test("a pass over 1000 rows", async ({ bench }) => {
    await bench.compare(
      bench("every cell", () => readPass(rows1k, columns)),
      bench("stored cells", () => readPass(rows1k, storedColumns)),
      BENCHMARK_RUN_OPTIONS,
    );
  });

  test("a pass over 10000 rows", async ({ bench }) => {
    await bench.compare(
      bench("every cell", () => readPass(rows10k, columns)),
      bench("stored cells", () => readPass(rows10k, storedColumns)),
      BENCHMARK_RUN_OPTIONS,
    );
  });

  test("the grid sorts 100 rows by the rank", async ({ bench }) => {
    const readCell100 = compileSheetColumns(columns)(rows100);
    await bench.compare(
      bench("by rank", () => sortRows(rows100, rowIdIndexMap100, readCell100, rankColumn)),
      bench("by a", () => sortRows(rows100, rowIdIndexMap100, readCell100, aColumn)),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 3, warmupIterations: 0 },
    );
  });

  test("the grid sorts 1000 rows by the rank", async ({ bench }) => {
    const readCell1k = compileSheetColumns(columns)(rows1k);
    await bench.compare(
      bench("by rank", () => sortRows(rows1k, rowIdIndexMap1k, readCell1k, rankColumn)),
      bench("by a", () => sortRows(rows1k, rowIdIndexMap1k, readCell1k, aColumn)),
      { ...BENCHMARK_RUN_OPTIONS, iterations: 3, warmupIterations: 0 },
    );
  });
});
