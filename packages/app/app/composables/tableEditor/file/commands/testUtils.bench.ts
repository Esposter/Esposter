import type { Row } from "#shared/models/tableEditor/file/datasource/Row";
import type { IndexedRow } from "@/models/tableEditor/file/commands/IndexedRow";

import { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import { makeColumn, makeDataSource, makeRow } from "@/composables/tableEditor/file/commands/testUtils.test";

export const BENCH_COLUMN_NAMES = ["a", "b", "c", "d", "e"];
export const benchColumns = BENCH_COLUMN_NAMES.map((name) => makeColumn(name));

export const generateBenchRows = (count: number, { offset = 0, uniqueValues = count } = {}): Row[] =>
  Array.from({ length: count }, (_, index) => {
    const key = offset + (index % uniqueValues);
    return makeRow(Object.fromEntries(BENCH_COLUMN_NAMES.map((name) => [name, key])));
  });

export const benchRows100 = generateBenchRows(100);
export const benchRows1k = generateBenchRows(1000);
export const benchRows10k = generateBenchRows(10000);

export const benchDataSource100HalfDuplicates = makeDataSource(
  benchColumns,
  generateBenchRows(100, { uniqueValues: 50 }),
);
export const benchDataSource1kHalfDuplicates = makeDataSource(
  benchColumns,
  generateBenchRows(1000, { uniqueValues: 500 }),
);
export const benchDataSource10kHalfDuplicates = makeDataSource(
  benchColumns,
  generateBenchRows(10000, { uniqueValues: 5000 }),
);

export const makeEveryNthIndexedRows = (rows: Row[], step: number): IndexedRow[] =>
  rows.flatMap((row, index) => (index % step === 0 ? [{ index, row }] : []));

export const makeBenchItem = (rows: Row[]) => {
  const item = new CsvDataSourceItem();
  item.dataSource = makeDataSource(benchColumns, [...rows]);
  return item;
};

export const makeBenchItemWithRows = (rows: Row[]) => {
  const item = new CsvDataSourceItem();
  item.dataSource = makeDataSource(benchColumns, rows);
  return item;
};

export const makeOriginalRowValues = (rows: Row[], columnName: string) =>
  rows.map((row) => row.data[columnName] ?? null);
